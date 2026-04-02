--
-- PostgreSQL database dump
--

\restrict SdeCO8RFJImGlH2HHkpdofl3E4tfIZt70gKLQn9wfNRHFbaUM1BnDK2h5hro79j

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: bonguflix_user
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO bonguflix_user;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: bonguflix_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO bonguflix_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: bonguflix_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: bonguflix_user
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.account OWNER TO bonguflix_user;

--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: bonguflix_user
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


ALTER TABLE neon_auth.invitation OWNER TO bonguflix_user;

--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: bonguflix_user
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


ALTER TABLE neon_auth.jwks OWNER TO bonguflix_user;

--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: bonguflix_user
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.member OWNER TO bonguflix_user;

--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: bonguflix_user
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


ALTER TABLE neon_auth.organization OWNER TO bonguflix_user;

--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: bonguflix_user
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


ALTER TABLE neon_auth.project_config OWNER TO bonguflix_user;

--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: bonguflix_user
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


ALTER TABLE neon_auth.session OWNER TO bonguflix_user;

--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: bonguflix_user
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


ALTER TABLE neon_auth."user" OWNER TO bonguflix_user;

--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: bonguflix_user
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE neon_auth.verification OWNER TO bonguflix_user;

--
-- Name: credits; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.credits (
    id bigint NOT NULL,
    media_type text,
    media_id bigint NOT NULL,
    person_id bigint,
    role text,
    character_name text,
    order_number integer,
    CONSTRAINT credits_media_type_check CHECK ((media_type = ANY (ARRAY['movie'::text, 'tv'::text])))
);


ALTER TABLE public.credits OWNER TO bonguflix_user;

--
-- Name: credits_id_seq; Type: SEQUENCE; Schema: public; Owner: bonguflix_user
--

CREATE SEQUENCE public.credits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.credits_id_seq OWNER TO bonguflix_user;

--
-- Name: credits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bonguflix_user
--

ALTER SEQUENCE public.credits_id_seq OWNED BY public.credits.id;


--
-- Name: episodes; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.episodes (
    id bigint NOT NULL,
    tv_show_id bigint,
    season_id bigint,
    episode_number integer NOT NULL,
    title text NOT NULL,
    overview text,
    runtime integer,
    air_date date,
    still_path text,
    vote_average numeric
);


ALTER TABLE public.episodes OWNER TO bonguflix_user;

--
-- Name: episodes_id_seq; Type: SEQUENCE; Schema: public; Owner: bonguflix_user
--

CREATE SEQUENCE public.episodes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.episodes_id_seq OWNER TO bonguflix_user;

--
-- Name: episodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bonguflix_user
--

ALTER SEQUENCE public.episodes_id_seq OWNED BY public.episodes.id;


--
-- Name: genres; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.genres (
    id integer NOT NULL,
    name text NOT NULL,
    tmdb_id integer
);


ALTER TABLE public.genres OWNER TO bonguflix_user;

--
-- Name: genres_id_seq; Type: SEQUENCE; Schema: public; Owner: bonguflix_user
--

CREATE SEQUENCE public.genres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genres_id_seq OWNER TO bonguflix_user;

--
-- Name: genres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bonguflix_user
--

ALTER SEQUENCE public.genres_id_seq OWNED BY public.genres.id;


--
-- Name: keywords; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.keywords (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.keywords OWNER TO bonguflix_user;

--
-- Name: keywords_id_seq; Type: SEQUENCE; Schema: public; Owner: bonguflix_user
--

CREATE SEQUENCE public.keywords_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.keywords_id_seq OWNER TO bonguflix_user;

--
-- Name: keywords_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bonguflix_user
--

ALTER SEQUENCE public.keywords_id_seq OWNED BY public.keywords.id;


--
-- Name: media_images; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.media_images (
    id bigint NOT NULL,
    media_type text,
    media_id bigint,
    image_type text,
    path text NOT NULL,
    width integer,
    height integer,
    aspect_ratio numeric,
    CONSTRAINT media_images_media_type_check CHECK ((media_type = ANY (ARRAY['movie'::text, 'tv'::text, 'person'::text, 'episode'::text])))
);


ALTER TABLE public.media_images OWNER TO bonguflix_user;

--
-- Name: media_images_id_seq; Type: SEQUENCE; Schema: public; Owner: bonguflix_user
--

CREATE SEQUENCE public.media_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_images_id_seq OWNER TO bonguflix_user;

--
-- Name: media_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bonguflix_user
--

ALTER SEQUENCE public.media_images_id_seq OWNED BY public.media_images.id;


--
-- Name: movie_genres; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.movie_genres (
    movie_id bigint NOT NULL,
    genre_id integer NOT NULL
);


ALTER TABLE public.movie_genres OWNER TO bonguflix_user;

--
-- Name: movie_keywords; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.movie_keywords (
    movie_id bigint NOT NULL,
    keyword_id integer NOT NULL
);


ALTER TABLE public.movie_keywords OWNER TO bonguflix_user;

--
-- Name: movies; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.movies (
    id bigint NOT NULL,
    tmdb_id integer,
    imdb_id text,
    title text NOT NULL,
    original_title text,
    overview text,
    release_date date,
    year_released integer,
    runtime integer,
    original_language text,
    popularity numeric,
    vote_average numeric,
    vote_count integer,
    poster_path text,
    backdrop_path text,
    trailer_url text,
    imdb_rating numeric,
    rotten_tomatoes numeric,
    metacritic numeric,
    age_certification text,
    budget bigint,
    revenue bigint,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.movies OWNER TO bonguflix_user;

--
-- Name: movies_id_seq; Type: SEQUENCE; Schema: public; Owner: bonguflix_user
--

CREATE SEQUENCE public.movies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movies_id_seq OWNER TO bonguflix_user;

--
-- Name: movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bonguflix_user
--

ALTER SEQUENCE public.movies_id_seq OWNED BY public.movies.id;


--
-- Name: people; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.people (
    id bigint NOT NULL,
    tmdb_id integer,
    imdb_id text,
    name text NOT NULL,
    biography text,
    profile_path text,
    known_for_department text,
    birthday date,
    deathday date,
    popularity numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.people OWNER TO bonguflix_user;

--
-- Name: people_id_seq; Type: SEQUENCE; Schema: public; Owner: bonguflix_user
--

CREATE SEQUENCE public.people_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.people_id_seq OWNER TO bonguflix_user;

--
-- Name: people_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bonguflix_user
--

ALTER SEQUENCE public.people_id_seq OWNED BY public.people.id;


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.seasons (
    id bigint NOT NULL,
    tv_show_id bigint,
    season_number integer NOT NULL,
    name text,
    overview text,
    poster_path text,
    air_date date,
    episode_count integer
);


ALTER TABLE public.seasons OWNER TO bonguflix_user;

--
-- Name: seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: bonguflix_user
--

CREATE SEQUENCE public.seasons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seasons_id_seq OWNER TO bonguflix_user;

--
-- Name: seasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bonguflix_user
--

ALTER SEQUENCE public.seasons_id_seq OWNED BY public.seasons.id;


--
-- Name: tv_genres; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.tv_genres (
    tv_show_id bigint NOT NULL,
    genre_id integer NOT NULL
);


ALTER TABLE public.tv_genres OWNER TO bonguflix_user;

--
-- Name: tv_keywords; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.tv_keywords (
    tv_show_id bigint NOT NULL,
    keyword_id integer NOT NULL
);


ALTER TABLE public.tv_keywords OWNER TO bonguflix_user;

--
-- Name: tv_shows; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.tv_shows (
    id bigint NOT NULL,
    tmdb_id integer,
    name text NOT NULL,
    original_name text,
    overview text,
    first_air_date date,
    last_air_date date,
    number_of_seasons integer,
    number_of_episodes integer,
    in_production boolean,
    status text,
    original_language text,
    poster_path text,
    backdrop_path text,
    trailer_url text,
    vote_average numeric,
    popularity numeric,
    age_certification text,
    imdb_rating numeric,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tv_shows OWNER TO bonguflix_user;

--
-- Name: tv_shows_id_seq; Type: SEQUENCE; Schema: public; Owner: bonguflix_user
--

CREATE SEQUENCE public.tv_shows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tv_shows_id_seq OWNER TO bonguflix_user;

--
-- Name: tv_shows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bonguflix_user
--

ALTER SEQUENCE public.tv_shows_id_seq OWNED BY public.tv_shows.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.user_sessions (
    session_id text NOT NULL,
    username text,
    slug text NOT NULL,
    expires_at timestamp without time zone DEFAULT (now() + '7 days'::interval),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_sessions OWNER TO bonguflix_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: bonguflix_user
--

CREATE TABLE public.users (
    username text NOT NULL,
    slug text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    last_active timestamp without time zone DEFAULT now(),
    preferences jsonb DEFAULT '{}'::jsonb,
    password_hash text DEFAULT ''::text,
    profile_pic text
);


ALTER TABLE public.users OWNER TO bonguflix_user;

--
-- Name: credits id; Type: DEFAULT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.credits ALTER COLUMN id SET DEFAULT nextval('public.credits_id_seq'::regclass);


--
-- Name: episodes id; Type: DEFAULT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.episodes ALTER COLUMN id SET DEFAULT nextval('public.episodes_id_seq'::regclass);


--
-- Name: genres id; Type: DEFAULT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.genres ALTER COLUMN id SET DEFAULT nextval('public.genres_id_seq'::regclass);


--
-- Name: keywords id; Type: DEFAULT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.keywords ALTER COLUMN id SET DEFAULT nextval('public.keywords_id_seq'::regclass);


--
-- Name: media_images id; Type: DEFAULT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.media_images ALTER COLUMN id SET DEFAULT nextval('public.media_images_id_seq'::regclass);


--
-- Name: movies id; Type: DEFAULT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movies ALTER COLUMN id SET DEFAULT nextval('public.movies_id_seq'::regclass);


--
-- Name: people id; Type: DEFAULT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.people ALTER COLUMN id SET DEFAULT nextval('public.people_id_seq'::regclass);


--
-- Name: seasons id; Type: DEFAULT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.seasons ALTER COLUMN id SET DEFAULT nextval('public.seasons_id_seq'::regclass);


--
-- Name: tv_shows id; Type: DEFAULT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.tv_shows ALTER COLUMN id SET DEFAULT nextval('public.tv_shows_id_seq'::regclass);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: credits credits_media_type_media_id_person_id_role_character_name_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_media_type_media_id_person_id_role_character_name_key UNIQUE (media_type, media_id, person_id, role, character_name);


--
-- Name: credits credits_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_pkey PRIMARY KEY (id);


--
-- Name: episodes episodes_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_pkey PRIMARY KEY (id);


--
-- Name: episodes episodes_tv_show_id_season_id_episode_number_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_tv_show_id_season_id_episode_number_key UNIQUE (tv_show_id, season_id, episode_number);


--
-- Name: genres genres_name_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_name_key UNIQUE (name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- Name: keywords keywords_name_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.keywords
    ADD CONSTRAINT keywords_name_key UNIQUE (name);


--
-- Name: keywords keywords_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.keywords
    ADD CONSTRAINT keywords_pkey PRIMARY KEY (id);


--
-- Name: media_images media_images_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.media_images
    ADD CONSTRAINT media_images_pkey PRIMARY KEY (id);


--
-- Name: movie_genres movie_genres_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_pkey PRIMARY KEY (movie_id, genre_id);


--
-- Name: movie_keywords movie_keywords_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movie_keywords
    ADD CONSTRAINT movie_keywords_pkey PRIMARY KEY (movie_id, keyword_id);


--
-- Name: movies movies_imdb_id_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_imdb_id_key UNIQUE (imdb_id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: movies movies_tmdb_id_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_tmdb_id_key UNIQUE (tmdb_id);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);


--
-- Name: people people_tmdb_id_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_tmdb_id_key UNIQUE (tmdb_id);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_tv_show_id_season_number_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_tv_show_id_season_number_key UNIQUE (tv_show_id, season_number);


--
-- Name: tv_genres tv_genres_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.tv_genres
    ADD CONSTRAINT tv_genres_pkey PRIMARY KEY (tv_show_id, genre_id);


--
-- Name: tv_keywords tv_keywords_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.tv_keywords
    ADD CONSTRAINT tv_keywords_pkey PRIMARY KEY (tv_show_id, keyword_id);


--
-- Name: tv_shows tv_shows_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.tv_shows
    ADD CONSTRAINT tv_shows_pkey PRIMARY KEY (id);


--
-- Name: tv_shows tv_shows_tmdb_id_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.tv_shows
    ADD CONSTRAINT tv_shows_tmdb_id_key UNIQUE (tmdb_id);


--
-- Name: media_images uq_media_images_type_id_path; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.media_images
    ADD CONSTRAINT uq_media_images_type_id_path UNIQUE (media_type, media_id, image_type, path);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- Name: users users_slug_key; Type: CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_slug_key UNIQUE (slug);


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: bonguflix_user
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: bonguflix_user
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: bonguflix_user
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: bonguflix_user
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: bonguflix_user
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: bonguflix_user
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: bonguflix_user
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: bonguflix_user
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: idx_credits_media; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_credits_media ON public.credits USING btree (media_type, media_id);


--
-- Name: idx_episodes_show_season; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_episodes_show_season ON public.episodes USING btree (tv_show_id, season_id);


--
-- Name: idx_movies_imdb; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_movies_imdb ON public.movies USING btree (imdb_id);


--
-- Name: idx_movies_popularity; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_movies_popularity ON public.movies USING btree (popularity DESC);


--
-- Name: idx_movies_release; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_movies_release ON public.movies USING btree (release_date DESC);


--
-- Name: idx_movies_title_trgm; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_movies_title_trgm ON public.movies USING gin (title public.gin_trgm_ops);


--
-- Name: idx_movies_tmdb; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_movies_tmdb ON public.movies USING btree (tmdb_id);


--
-- Name: idx_sessions_expires; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_sessions_expires ON public.user_sessions USING btree (expires_at);


--
-- Name: idx_tv_name_trgm; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_tv_name_trgm ON public.tv_shows USING gin (name public.gin_trgm_ops);


--
-- Name: idx_users_slug; Type: INDEX; Schema: public; Owner: bonguflix_user
--

CREATE INDEX idx_users_slug ON public.users USING btree (slug);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: bonguflix_user
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: credits credits_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id);


--
-- Name: episodes episodes_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id);


--
-- Name: episodes episodes_tv_show_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_tv_show_id_fkey FOREIGN KEY (tv_show_id) REFERENCES public.tv_shows(id);


--
-- Name: movie_genres movie_genres_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id);


--
-- Name: movie_genres movie_genres_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: movie_keywords movie_keywords_keyword_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movie_keywords
    ADD CONSTRAINT movie_keywords_keyword_id_fkey FOREIGN KEY (keyword_id) REFERENCES public.keywords(id);


--
-- Name: movie_keywords movie_keywords_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.movie_keywords
    ADD CONSTRAINT movie_keywords_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id);


--
-- Name: seasons seasons_tv_show_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_tv_show_id_fkey FOREIGN KEY (tv_show_id) REFERENCES public.tv_shows(id) ON DELETE CASCADE;


--
-- Name: tv_genres tv_genres_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.tv_genres
    ADD CONSTRAINT tv_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id);


--
-- Name: tv_genres tv_genres_tv_show_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.tv_genres
    ADD CONSTRAINT tv_genres_tv_show_id_fkey FOREIGN KEY (tv_show_id) REFERENCES public.tv_shows(id) ON DELETE CASCADE;


--
-- Name: tv_keywords tv_keywords_keyword_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.tv_keywords
    ADD CONSTRAINT tv_keywords_keyword_id_fkey FOREIGN KEY (keyword_id) REFERENCES public.keywords(id);


--
-- Name: tv_keywords tv_keywords_tv_show_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.tv_keywords
    ADD CONSTRAINT tv_keywords_tv_show_id_fkey FOREIGN KEY (tv_show_id) REFERENCES public.tv_shows(id);


--
-- Name: user_sessions user_sessions_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bonguflix_user
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_username_fkey FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: bonguflix_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: FUNCTION gtrgm_in(cstring); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_in(cstring) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_out(public.gtrgm); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_out(public.gtrgm) TO bonguflix_user;


--
-- Name: TYPE gtrgm; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TYPE public.gtrgm TO bonguflix_user;


--
-- Name: FUNCTION gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) TO bonguflix_user;


--
-- Name: FUNCTION gin_extract_value_trgm(text, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_extract_value_trgm(text, internal) TO bonguflix_user;


--
-- Name: FUNCTION gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) TO bonguflix_user;


--
-- Name: FUNCTION gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_compress(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_compress(internal) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_consistent(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_decompress(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_decompress(internal) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_distance(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_options(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_options(internal) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_penalty(internal, internal, internal) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_picksplit(internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_picksplit(internal, internal) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_same(public.gtrgm, public.gtrgm, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_same(public.gtrgm, public.gtrgm, internal) TO bonguflix_user;


--
-- Name: FUNCTION gtrgm_union(internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_union(internal, internal) TO bonguflix_user;


--
-- Name: FUNCTION set_limit(real); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_limit(real) TO bonguflix_user;


--
-- Name: FUNCTION show_limit(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.show_limit() TO bonguflix_user;


--
-- Name: FUNCTION show_trgm(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.show_trgm(text) TO bonguflix_user;


--
-- Name: FUNCTION similarity(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.similarity(text, text) TO bonguflix_user;


--
-- Name: FUNCTION similarity_dist(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.similarity_dist(text, text) TO bonguflix_user;


--
-- Name: FUNCTION similarity_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.similarity_op(text, text) TO bonguflix_user;


--
-- Name: FUNCTION strict_word_similarity(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity(text, text) TO bonguflix_user;


--
-- Name: FUNCTION strict_word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_commutator_op(text, text) TO bonguflix_user;


--
-- Name: FUNCTION strict_word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) TO bonguflix_user;


--
-- Name: FUNCTION strict_word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_op(text, text) TO bonguflix_user;


--
-- Name: FUNCTION strict_word_similarity_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_op(text, text) TO bonguflix_user;


--
-- Name: FUNCTION word_similarity(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity(text, text) TO bonguflix_user;


--
-- Name: FUNCTION word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_commutator_op(text, text) TO bonguflix_user;


--
-- Name: FUNCTION word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_dist_commutator_op(text, text) TO bonguflix_user;


--
-- Name: FUNCTION word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_dist_op(text, text) TO bonguflix_user;


--
-- Name: FUNCTION word_similarity_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_op(text, text) TO bonguflix_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO bonguflix_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO bonguflix_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO bonguflix_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO bonguflix_user;


--
-- PostgreSQL database dump complete
--

\unrestrict SdeCO8RFJImGlH2HHkpdofl3E4tfIZt70gKLQn9wfNRHFbaUM1BnDK2h5hro79j

