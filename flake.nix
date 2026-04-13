{
  description = "Static webapp development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_25
            typescript
            typescript-language-server
            live-server
            esbuild
          ];

          shellHook = ''
            echo "Static webapp development environment loaded!"
            echo "Available commands:"
            echo "  tsc --watch    # Compile TypeScript in watch mode"
            echo "  live-server    # Start development server"
            echo "  npm init -y    # Initialize package.json if needed"
          '';
        };
      });
}