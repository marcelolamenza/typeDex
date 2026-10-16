# Team Builder catalog sources

`pokemon.json` is a build-time snapshot of the PokéAPI CSV dataset. It contains the 1,025 standard species with English species names, National Pokédex numbers, default species typing, and the generation where each species was introduced. The source files are:

- [`pokemon.csv`](https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/pokemon.csv) for the default Pokémon record and species relationship.
- [`pokemon_species.csv`](https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/pokemon_species.csv) for species identifiers and introduction generations.
- [`pokemon_species_names.csv`](https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/pokemon_species_names.csv) for English names.
- [`pokemon_types.csv`](https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/pokemon_types.csv) for type slots.

Entries are limited to species IDs 1–1025 and the default Pokémon record for each species, so alternate forms do not create duplicate catalog entries. The catalog is bundled locally; searching and filtering never call a service. To update it, regenerate the JSON from the source CSVs and rerun catalog validation tests.

Sprites are lazy-loaded from the numbered default sprite paths in the [PokéAPI sprites repository](https://github.com/PokeAPI/sprites), using `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{national-dex-number}.png`. The sprite repository documents its Pokémon sprite tree and hosts the assets separately from the API. Images are not downloaded at page startup. An on-screen sprite failure falls back to the Pokémon's initial without affecting selection or calculations.

The application uses its own Generation IX type chart in `src/data/typeCharts.ts` for matchup calculations; catalog typing and sprite sources do not supply or override effectiveness rules. Pokémon names and artwork are respective owner properties. See the upstream repositories for source licensing and attribution details.
