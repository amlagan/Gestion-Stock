
import express from "express";
import {v4 as uuidv4} from "uuid";
import fs from "fs";


const app = express();
const port = 3000;
const DATA_FILE = "produits.json";
// pour parser le json
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // pour x-www-form-urlencoded

let produits = [];


app.post("/produits", (req, res) => {
  const produit = req.body;
  if (! produit.nom || ! produit.prix || ! produit.quantite) {
    return res.status(400).send("Nom, prix et quantite sont requis");
  }
  produit.id = uuidv4(); // Ajoute un identifiant unique avec uuid
  produits.push(produit);
  res.status(201).send(produit);
  console.log("Produit ajouté:", produit);
  saveProduits();

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
  res.status(200).send(produits[index]);
});

app.delete("/produits/:id", (req, res) => {
  const id = req.params.id;
  const index = produits.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).send("Produit non trouvé");
  }
  produits.splice(index, 1);
  res.status(204).send();
});


app.get("/", (req, res) => {
  res.send(produits);
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});