import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { POKEMONS_PER_PAGE } from "../../app/config";

export const getPokemons = createAsyncThunk(
  "pokemons/getPokemons",
  async ({ page, search, type }, { rejectWithValue }) => {
    try {
      let url = `/pokemons?page=${page}&limit=${POKEMONS_PER_PAGE}`;

      if (search) url += `&search=${search}`;
      if (type) url += `&type=${type}`;

      const response = await apiService.get(url);

      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const getPokemonById = createAsyncThunk(
  "pokemons/getPokemonById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/pokemons/${id}`);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const addPokemon = createAsyncThunk(
  "pokemons/addPokemon",
  async ({ name, id, imgUrl, types }, { rejectWithValue }) => {
    try {
      await apiService.post("/pokemons", {
        id,
        name,
        url: imgUrl,
        types,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const editPokemon = createAsyncThunk(
  "pokemons/editPokemon",
  async ({ id, name, url, types }, { rejectWithValue }) => {
    try {
      await apiService.put(`/pokemons/${id}`, {
        name,
        url,
        types,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deletePokemon = createAsyncThunk(
  "pokemons/deletePokemon",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/pokemons/${id}`);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  loading: false,
  pokemons: [],
  pokemon: {
    pokemon: null,
    previousPokemon: null,
    nextPokemon: null,
  },
  page: 1,
  totalPages: 1,
  totalPokemons: 0,
  search: "",
  type: "",
  errorMessage: "",
};

const pokemonSlice = createSlice({
  name: "pokemons",
  initialState,

  reducers: {
    changePage(state) {
      state.page += 1;
    },

    searchQuery(state, action) {
      state.search = action.payload;
      state.page = 1;
    },

    typeQuery(state, action) {
      state.type = action.payload;
      state.page = 1;
    },
  },

  extraReducers: (builder) => {
    builder

      // GET POKEMONS
      .addCase(getPokemons.pending, (state) => {
        state.loading = true;
      })

      .addCase(getPokemons.fulfilled, (state, action) => {
        state.loading = false;

        state.page = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalPokemons = action.payload.totalPokemons;

        if (state.page === 1) {
          state.pokemons = action.payload.pokemons;
        } else {
          state.pokemons.push(...action.payload.pokemons);
        }
      })

      .addCase(getPokemons.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message || action.error.message;
      })

      // GET POKEMON DETAIL
      .addCase(getPokemonById.pending, (state) => {
        state.loading = true;
      })

      .addCase(getPokemonById.fulfilled, (state, action) => {
        state.loading = false;
        state.pokemon = action.payload;
      })

      .addCase(getPokemonById.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message || action.error.message;
      })

      // ADD
      .addCase(addPokemon.pending, (state) => {
        state.loading = true;
      })

      .addCase(addPokemon.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(addPokemon.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message || action.error.message;
      })

      // EDIT
      .addCase(editPokemon.pending, (state) => {
        state.loading = true;
      })

      .addCase(editPokemon.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(editPokemon.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message || action.error.message;
      })

      // DELETE
      .addCase(deletePokemon.pending, (state) => {
        state.loading = true;
      })

      .addCase(deletePokemon.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(deletePokemon.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message || action.error.message;
      });
  },
});

export const { changePage, searchQuery, typeQuery } = pokemonSlice.actions;

export default pokemonSlice.reducer;
