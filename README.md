
<div>
  <img src="osef-frontend/public/logo_osef.png" alt="OSEF Logo" width="200"/>
</div>

## Contexte
Dans le cadre du projet de **LABO d’entreprise (BTS SIO 2ᵉ année)**, une application web interne a été développée pour permettre la gestion de plannings.  
L’objectif est de fournir aux utilisateurs une interface **simple** et **sécurisée** pour consulter et administrer un planning en ligne.  

---

## Fonctionnalités principales

- **Authentification sécurisée avec rôles** (utilisateur / administrateur).  
- **Page de connexion** avec gestion de sessions.  
- **Consultation du planning** : affichage par semaine.  

### Administration (réservée aux administrateurs)
- Ajout d’événements.  
- Modification d’événements.  
- Suppression d’événements.  

---

## Base de données
- **Relationnelle** (MariaDB).  

---

## Stack technique

- **Back-end** : Node.js + Express  
- **Base de données** : MariaDB  
- **Front-end** : React  
- **Serveur web** : Apache  

---

## Sécurité mise en place

- Hachage des mots de passe
- Protection contre l'injection SQL
