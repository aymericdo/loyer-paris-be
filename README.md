# loyer-paris-be (NodeJS)

## Description

Cette extension permet de savoir si le prix de votre loyer (ou futur loyer) est *potentiellement* légal ou non.
Ceci à pour but d'informer, et d'avertir les potentiels futurs locataires que certains loyers parisiens ne respectent pas l'encadrement des loyers, en vigueur depuis le 01/07/2019.

## Accessibilité

L'extension est disponible sur les sites suivants : seloger, leboncoin, pap, logic-immo, lefigaro-immo, et autres

* Disponible aussi sur Chrome : https://github.com/aymericdo/loyer-paris-chrome
* Disponible aussi sur Firefox : https://github.com/aymericdo/loyer-paris-firefox

## Extension store
* Chrome: https://chrome.google.com/webstore/detail/encadrement-loyers-paris/nkmghhgmpbngkbjnhpomddeglkpkkfeo?hl=fr
* Firefox: https://addons.mozilla.org/en-US/firefox/addon/encadrement-loyers-paris/

## Développement

Prérequis : Node 24 et npm 11 (voir `engines` dans `package.json`).

Optionnel, avec [devenv](https://devenv.sh) : `devenv shell` fournit Node et npm, `devenv up` lance un MongoDB local pour `npm run dev`.

```sh
npm ci
npm test
npm run dev
```

## Known gaps

- CI épinglée sur `ubuntu-24.04` : Playwright/MongoDB pas encore compatibles 26.04 ; à rebumper avant le retrait de l'image.
- Version MongoDB de prod inconnue : `devenv up` lance la 8.3, possiblement différente.
