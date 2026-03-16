import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { env } from './env';
import { supabase } from './supabase';
import type { Place, PlaceFormValues } from './types';

const emptyForm: PlaceFormValues = {
  name: '',
  short_review: '',
  full_description: '',
  address: '',
  latitude: '',
  longitude: '',
  image_url: '',
  city: '',
  country: '',
  tagsText: '',
};

function parseTags(value: string) {
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

function toFormValues(place?: Place | null): PlaceFormValues {
  if (!place) {
    return emptyForm;
  }

  return {
    name: place.name ?? '',
    short_review: place.short_review ?? '',
    full_description: place.full_description ?? '',
    address: place.address ?? '',
    latitude: place.latitude?.toString() ?? '',
    longitude: place.longitude?.toString() ?? '',
    image_url: place.image_url ?? '',
    city: place.city ?? '',
    country: place.country ?? '',
    tagsText: (place.tags ?? []).join(', '),
  };
}

function toNumberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchPlaces() {
  const { data, error } = await supabase
    .from('places')
    .select(
      'id, name, short_review, full_description, address, latitude, longitude, image_url, city, country, tags, created_at',
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as Place[]).map((place) => ({
    ...place,
    tags: Array.isArray(place.tags) ? place.tags : [],
  }));
}

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<PlaceFormValues>(emptyForm);
  const [search, setSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentEmail = session?.user.email?.toLowerCase() ?? null;
  const isAdmin = Boolean(currentEmail && env.adminEmails.includes(currentEmail));

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedPlaceId) ?? null,
    [places, selectedPlaceId],
  );

  const filteredPlaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return places;
    }

    return places.filter((place) => {
      const haystack = [
        place.name,
        place.short_review,
        place.city,
        place.country,
        ...(place.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [places, search]);

  useEffect(() => {
    if (!isAdmin) {
      setPlaces([]);
      setSelectedPlaceId(null);
      setFormValues(emptyForm);
      setIsLoadingPlaces(false);
      return;
    }

    const load = async () => {
      setIsLoadingPlaces(true);
      setErrorMessage(null);

      try {
        const nextPlaces = await fetchPlaces();
        setPlaces(nextPlaces);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load places.');
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    void load();
  }, [isAdmin]);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const email = emailInput.trim().toLowerCase();

    if (!email) {
      setErrorMessage('Enter your admin email first.');
      return;
    }

    if (!env.adminEmails.includes(email)) {
      setErrorMessage('That email is not in VITE_ADMIN_EMAILS.');
      return;
    }

    const redirectUrl = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setStatusMessage(`Magic link sent to ${email}. Open it in this browser to unlock admin.`);
  };

  const refreshPlaces = async (nextSelectedPlaceId?: string | null) => {
    const nextPlaces = await fetchPlaces();
    setPlaces(nextPlaces);

    if (nextSelectedPlaceId === null) {
      setSelectedPlaceId(null);
      setFormValues(emptyForm);
      return;
    }

    const targetId = nextSelectedPlaceId ?? selectedPlaceId;
    const nextSelectedPlace = nextPlaces.find((place) => place.id === targetId) ?? null;
    setSelectedPlaceId(nextSelectedPlace?.id ?? null);
    setFormValues(toFormValues(nextSelectedPlace));
  };

  const handleCreateNew = () => {
    setSelectedPlaceId(null);
    setFormValues(emptyForm);
    setStatusMessage('Creating a new place.');
    setErrorMessage(null);
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlaceId(place.id);
    setFormValues(toFormValues(place));
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleChange = (field: keyof PlaceFormValues, value: string) => {
    setFormValues((currentValue) => ({ ...currentValue, [field]: value }));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const payload = {
        name: formValues.name.trim(),
        short_review: formValues.short_review.trim(),
        full_description: formValues.full_description.trim(),
        address: formValues.address.trim(),
        latitude: toNumberOrNull(formValues.latitude),
        longitude: toNumberOrNull(formValues.longitude),
        image_url: formValues.image_url.trim(),
        city: formValues.city.trim() || null,
        country: formValues.country.trim() || null,
        tags: parseTags(formValues.tagsText),
      };

      if (!payload.name) {
        throw new Error('Place name is required.');
      }

      if (selectedPlaceId) {
        const { error } = await supabase.from('places').update(payload).eq('id', selectedPlaceId);
        if (error) throw error;
        setStatusMessage('Place updated.');
        await refreshPlaces(selectedPlaceId);
      } else {
        const { data, error } = await supabase.from('places').insert(payload).select('id').single();
        if (error) throw error;
        setStatusMessage('Place created.');
        await refreshPlaces((data as { id: string }).id);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save place.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlaceId) {
      return;
    }

    const confirmed = window.confirm('Delete this place? This cannot be undone from the admin UI.');
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const { error } = await supabase.from('places').delete().eq('id', selectedPlaceId);
      if (error) throw error;
      setStatusMessage('Place deleted.');
      await refreshPlaces(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete place.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setStatusMessage('Signed out.');
    setErrorMessage(null);
  };

  if (!session) {
    return (
      <div className="app-shell centered-shell">
        <div className="auth-card">
          <p className="eyebrow">CityTalk Admin</p>
          <h1>Solo-founder place manager</h1>
          <p className="muted">
            Sign in with a whitelisted admin email. This keeps the gate simple while still using
            Supabase auth instead of shipping an open write page.
          </p>

          <form className="stack-md" onSubmit={handleSignIn}>
            <label className="field">
              <span>Admin email</span>
              <input
                type="email"
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                placeholder="founder@example.com"
              />
            </label>
            <button type="submit">Send magic link</button>
          </form>

          {statusMessage ? <p className="status ok">{statusMessage}</p> : null}
          {errorMessage ? <p className="status error">{errorMessage}</p> : null}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="app-shell centered-shell">
        <div className="auth-card">
          <p className="eyebrow">CityTalk Admin</p>
          <h1>Access denied</h1>
          <p className="muted">
            Signed in as <strong>{currentEmail}</strong>, but that email is not in{' '}
            <code>VITE_ADMIN_EMAILS</code>.
          </p>
          <button type="button" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">CityTalk Admin</p>
          <h1>Places</h1>
          <p className="muted">Fast CRUD panel for places, tags, and image URLs.</p>
        </div>

        <div className="topbar-actions">
          <span className="user-pill">{currentEmail}</span>
          <button type="button" className="secondary-button" onClick={handleCreateNew}>
            New place
          </button>
          <button type="button" className="ghost-button" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="panel list-panel">
          <div className="panel-header">
            <div>
              <h2>Place list</h2>
              <p className="muted">{places.length} total</p>
            </div>
            <input
              className="search-input"
              placeholder="Search places or tags"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoadingPlaces ? <p className="muted">Loading places…</p> : null}

          <div className="place-list">
            {filteredPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                className={`place-list-item ${selectedPlaceId === place.id ? 'active' : ''}`}
                onClick={() => handleSelectPlace(place)}
              >
                <div className="place-list-title-row">
                  <strong>{place.name}</strong>
                  <span className="tag-count">{place.tags.length} tags</span>
                </div>
                <p>{place.short_review || 'No short review yet.'}</p>
                <div className="chips">
                  {place.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}

            {!isLoadingPlaces && filteredPlaces.length === 0 ? (
              <div className="empty-state">No places match that search.</div>
            ) : null}
          </div>
        </section>

        <section className="panel form-panel">
          <div className="panel-header">
            <div>
              <h2>{selectedPlace ? 'Edit place' : 'Add place'}</h2>
              <p className="muted">
                Keep it fast: image URL, comma-separated tags, and only the fields you actually use.
              </p>
            </div>
            {selectedPlace ? (
              <button
                type="button"
                className="danger-button"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            ) : null}
          </div>

          <form className="form-grid" onSubmit={handleSave}>
            <label className="field field-span-2">
              <span>Name</span>
              <input
                value={formValues.name}
                onChange={(event) => handleChange('name', event.target.value)}
              />
            </label>

            <label className="field field-span-2">
              <span>Short review</span>
              <textarea
                rows={3}
                value={formValues.short_review}
                onChange={(event) => handleChange('short_review', event.target.value)}
              />
            </label>

            <label className="field field-span-2">
              <span>Full description</span>
              <textarea
                rows={6}
                value={formValues.full_description}
                onChange={(event) => handleChange('full_description', event.target.value)}
              />
            </label>

            <label className="field field-span-2">
              <span>Address</span>
              <input
                value={formValues.address}
                onChange={(event) => handleChange('address', event.target.value)}
              />
            </label>

            <label className="field">
              <span>City</span>
              <input
                value={formValues.city}
                onChange={(event) => handleChange('city', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Country</span>
              <input
                value={formValues.country}
                onChange={(event) => handleChange('country', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Latitude</span>
              <input
                value={formValues.latitude}
                onChange={(event) => handleChange('latitude', event.target.value)}
                placeholder="43.06"
              />
            </label>

            <label className="field">
              <span>Longitude</span>
              <input
                value={formValues.longitude}
                onChange={(event) => handleChange('longitude', event.target.value)}
                placeholder="141.35"
              />
            </label>

            <label className="field field-span-2">
              <span>Image URL</span>
              <input
                value={formValues.image_url}
                onChange={(event) => handleChange('image_url', event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="field field-span-2">
              <span>Tags</span>
              <input
                value={formValues.tagsText}
                onChange={(event) => handleChange('tagsText', event.target.value)}
                placeholder="cafe, hidden gem, local favorite"
              />
              <small>Comma-separated. They will be normalized to lowercase.</small>
            </label>

            <div className="field-span-2 form-footer">
              <div>
                {statusMessage ? <p className="status ok">{statusMessage}</p> : null}
                {errorMessage ? <p className="status error">{errorMessage}</p> : null}
              </div>
              <button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : selectedPlace ? 'Save changes' : 'Create place'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
