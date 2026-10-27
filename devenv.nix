{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    npm.enable = true;
  };

  # `npm run dev` se connecte à mongodb://localhost (src/db/db.ts) ; les tests utilisent un Mongo en mémoire.
  services.mongodb.enable = true;
}
