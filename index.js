
import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// app.use(bodyParser.json());

// pour parser le json
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // pour x-www-form-urlencoded

let produits = [];

app.post("/produits", (req, res) => {
  const produit = req.body;
  if (! produit.nom || ! produit.prix || ! produit.quantite) {
    return res.status(400).send("Nom, prix et quantite sont requis");
  }

  produits.push(produit);
 res.status(201).send(produit);
 console.log("Produit ajouté:", produit);
});

app.get("/produits", (req, res) => {
  res.send(produits);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});






app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});