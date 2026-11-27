# Configurer la publication d'une Story Instagram

L'application Meta est configurée avec **Instagram API with Unified Login**. C'est le bon parcours pour cette nouvelle intégration : il utilise `graph.facebook.com` et un token **System-user access token (SUAT)**. N'utilise pas les instructions « API setup with Instagram Login » ni un token de l'ancienne API Instagram Login.

## Générer un token de test dans Meta

1. Dans [Meta for Developers](https://developers.facebook.com/apps/), sélectionne l'app **Encadrement**.
2. Ouvre **Use cases** > **Manage messaging & content on Instagram** > **Customize**.
3. Sélectionne **API setup with Unified login**.
4. Dans **Configure your app**, crée une configuration et vérifie qu'elle demande au minimum `instagram_basic` et `instagram_content_publish`. Tu peux retirer les permissions inutiles. Enregistre la configuration et vérifie son type de token et son expiration dans l'aperçu.
5. Dans **Generate access tokens**, choisis **Add account** et ajoute le compte Instagram professionnel comme **Instagram Tester**.
6. Accepte l'invitation dans Instagram sur le Web : **Settings** > **Website permissions** > **Apps and websites** > **Tester Invites**.
7. De retour dans Meta, sélectionne **Generate token** à côté du compte. Dans la fenêtre Meta, partage le compte Instagram voulu et clique sur **Continuer**, puis accepte l'écran de confirmation des permissions s'il s'affiche. L'ad account est facultatif et n'est pas nécessaire pour publier la Story. L'abonnement **Webhooks** peut rester désactivé : ce cron n'utilise pas les webhooks.
8. Termine le parcours et copie le token lorsqu'il est proposé. Meta ne l'affiche qu'une fois : garde-le privé et ne le colle ni dans le code ni dans Git.
9. Configure les secrets suivants dans l'environnement de production :

```text
INSTAGRAM_ACCESS_TOKEN=<token SUAT généré dans Meta>
INSTAGRAM_USER_ID=<id Instagram du compte cible>
INSTAGRAM_STORY_IMAGE_URL=https://backend.aymericdo.ovh/encadrement-back/instagram-story/latest.jpg
INSTAGRAM_GRAPH_API_VERSION=v27.0
```

Le compte Instagram doit être professionnel et lié à un portefeuille Business accessible à la personne qui fait la configuration. En mode développement, l'accès standard permet de tester avec les personnes ayant un rôle sur l'app ; pour d'autres comptes, Meta demande l'accès avancé et l'app en mode Live.

## Trouver l'ID du compte Instagram

Le token Unified Login représente le système utilisateur Business, pas directement le compte Instagram. N'utilise donc pas `/me?fields=user_id,username` de l'ancien guide. Appelle plutôt :

```text
GET https://graph.facebook.com/v27.0/me/assigned_instagram_accounts?fields=id,username
Authorization: Bearer <INSTAGRAM_ACCESS_TOKEN>
```

Repère le compte voulu grâce à `username`, puis copie son champ `id` dans `INSTAGRAM_USER_ID`. Ne partage jamais le token ou le secret de l'app pour obtenir de l'aide.

## Expiration et renouvellement

L'expiration du SUAT dépend de la configuration choisie dans Meta ; vérifie sa valeur dans l'aperçu de la configuration. Unified Login ne suit pas le renouvellement des tokens Instagram Login décrit dans les anciens guides. Meta fournit le **Business Integration System User Access Token Management API** pour gérer ou renouveler ces SUAT. Note également qu'un token cesse de fonctionner si l'app est retirée du portefeuille Business ou si le compte Instagram change de portefeuille.

## URL de redirection et fenêtre de token

Le champ **Redirect URL** de la section de configuration sert à créer l'URL de connexion OAuth que ton propre site intégrerait. Ce n'est pas l'URL de l'image de Story. Pour un parcours OAuth dans notre application, il faudrait une vraie route HTTPS qui reçoit le retour Meta ; le projet n'en a pas actuellement. N'entre donc pas une URL inventée, ni `/instagram-story/latest.jpg`, pour essayer de corriger la génération du token de test depuis le tableau de bord.

Si la fenêtre **Generate token** se ferme sans afficher le token, retourne dans **Generate access tokens** et actualise la page : le compte doit apparaître dans la liste pour que le token puisse être utilisé. Le champ Redirect URL seul ne confirme pas que le token a été créé.

Si aucune ligne n'apparaît :

1. Vérifie que le compte Instagram professionnel est toujours listé dans **Generate access tokens** et que l'invitation Instagram Tester a été acceptée.
2. Relance l'opération dans une fenêtre normale d'un autre navigateur. Autorise les fenêtres contextuelles et les cookies pour Meta, et désactive temporairement les extensions de blocage pour ce site.
3. Vérifie que la configuration Unified Login inclut `instagram_basic` et `instagram_content_publish`, puis réessaie en choisissant le portefeuille Business qui détient le compte Instagram.
4. Si ça échoue encore, contacte le support Meta en indiquant l'ID de l'app, le `config_id`, l'heure approximative et le fuseau horaire, l'étape où le parcours s'arrête, le mode de connexion choisi, et si le portefeuille et le compte Instagram attendus étaient affichés. Ajoute le message d'erreur s'il y en a un. **N'envoie jamais de token, secret d'app ou mot de passe.**

## Ce que fait le cron

Chaque jour à 20 h 30 (heure de Paris), le cron examine les annonces non conformes des sept territoires utilisés par l'ancien service, collectées dans les 24 dernières heures. Il ne publie que si une annonce dépasse strictement de 100 € le plafond estimé hors charges ; si plusieurs correspondent, seule celle qui a le plus grand dépassement est retenue. La Story présente le territoire, la source, le loyer observé et le plafond estimé. Aucune Story n'est publiée s'il n'y a pas d'annonce éligible ; ce cas est tracé dans les logs, et les erreurs remontent dans Sentry.

L'image générée est conservée après le run, jusqu'à ce qu'une exécution suivante la remplace : `latest.jpg` sert donc toujours la dernière Story produite, y compris quand aucun candidat n'a été trouvé.

L'image est générée sans IA, au moment du cron. Meta doit pouvoir la télécharger depuis l'URL publique HTTPS fournie. Le fichier est un JPEG de Story vertical 1080 × 1920 ; le cron crée un conteneur `STORIES`, attend son état `FINISHED`, puis le publie avec `media_publish`.

## Documentation officielle Meta

- [Instagram API with Unified Login — Get Started](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/get-started) — emplacement de la configuration, permissions, token de test, récupération des IDs.
- [Authentication and access tokens](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/authentication) — type SUAT, hôte API et durée de vie.
- [Permissions](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/permissions) — permissions nécessaires pour publier.
- [Eligibility and troubleshooting](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/eligibility-and-troubleshooting) — conditions d'éligibilité et informations à réunir pour contacter le support.
- [Content Publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing) — publication via conteneur, image publique et endpoints.
- [IG User Media](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media) — détails des conteneurs Story et spécifications des images.
