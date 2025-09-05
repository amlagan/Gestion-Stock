
import express from "express";
import {v4 as uuidv4} from "uuid";
import fs from "fs";


const app = express();
const port = 3000;
const DATA_FILE = "produits.json";
const COMMANDES_FILE = "commandes.json";

let commandes = [];
let produits = [];


// pour parser le json
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // pour x-www-form-urlencoded




                // FUNCTIONS DE GESTION DES FICHIERS JSON


// Charger les produits depuis le fichier JSON au démarrage
function loadProduits() {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    produits = JSON.parse(data);
  }
}
// Sauvegarder les produits dans le fichier JSON
function saveProduits() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(produits, null, 2), "utf-8");
}


// Charger les commandes au démarrage
function loadCommandes() {
  if (fs.existsSync(COMMANDES_FILE)) {
    const data = fs.readFileSync(COMMANDES_FILE, "utf-8");
    commandes = JSON.parse(data);
  }
}
// Sauvegarder les commandes
function saveCommandes() {
  fs.writeFileSync(COMMANDES_FILE, JSON.stringify(commandes, null, 2), "utf-8");
}




// Charger les produits et commandesau démarrage
loadProduits();
loadCommandes();




// Routes CRUD pour les produits

app.post("/produits", (req, res) => {
  const produit = req.body;
  if (! produit.nom || ! produit.prix || ! produit.quantite) {
    return res.status(400).send("Nom, prix et quantite sont requis");
  }
  produit.id = uuidv4(); // Ajoute un identifiant unique avec uuid
  produits.push(produit);
  saveProduits(); // Sauvegarde après ajout
  res.status(201).send(produit);
  console.log("Produit ajouté:", produit);

});

app.patch("/produits/:id", (req, res) => {
  const id = req.params.id;
  const index = produits.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).send("Produit non trouvé");
  }
  const { nom, prix, quantite } = req.body;
  if (nom !== undefined) produits[index].nom = nom;
  if (prix !== undefined) produits[index].prix = prix;
  if (quantite !== undefined) produits[index].quantite = quantite;
  saveProduits(); // Sauvegarde après modification
  res.status(200).send(produits[index]);
});

app.delete("/produits/:id", (req, res) => {
  const id = req.params.id;
  const index = produits.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).send("Produit non trouvé");
  }
  produits.splice(index, 1);
  saveProduits(); // Sauvegarde après suppression
  res.status(204).send();
});







// Route pour passer une commande// Créer une commande
app.post("/commandes", (req, res) => {
  let produitsCommandes = req.body.produitsCommandes;
  if (typeof produitsCommandes === "string") {
    try {
      produitsCommandes = JSON.parse(produitsCommandes);
    } catch (e) {
      return res.status(400).send("Format produitsCommandes invalide");
    }
  }
  if (!Array.isArray(produitsCommandes) || produitsCommandes.length === 0) {
    return res.status(400).send("Liste de produits requise");
  }

  // Vérifier la disponibilité et mettre à jour le stock
  for (const pc of produitsCommandes) {
    const prod = produits.find(p => p.id === pc.id);
    if (!prod) return res.status(404).send(`Produit ${pc.id} non trouvé`);
    if (prod.quantite < pc.quantite) {
      return res.status(400).send(`Stock insuffisant pour ${prod.nom}`);
    }
  }

  // Décrémenter le stock
  for (const pc of produitsCommandes) {
    const prod = produits.find(p => p.id === pc.id);
    prod.quantite -= pc.quantite;
  }
  saveProduits();

  // Créer la commande
  const commande = {
    id: uuidv4(),
    date: new Date(),
    produits: produitsCommandes
  };
  commandes.push(commande);
  saveCommandes();
  console.log("Commande créée:", commande);
  res.status(201).send(commande);
});








app.get("/", (req, res) => {
  res.send(produits);
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});