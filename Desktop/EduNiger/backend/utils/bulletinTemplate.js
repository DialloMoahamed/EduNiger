const BULLETIN_CONFIG = {
  header: {
    title: "RÉPUBLIQUE DU NIGER",
    subtitle1: "MINISTÈRE DE L'ÉDUCATION NATIONALE",
    subtitle2: "RÉGION DE NIAMEY",
    subtitle3: "DIRECTION RÉGIONALE DE L'ÉDUCATION NATIONALE",
    subtitle4: "DIRECTION DÉPARTEMENTALE DE L'ÉDUCATION NATIONALE DE NIAMEY",
    subtitle5: "INSPECTION DE L'ENSEIGNEMENT SECONDAIRE CYCLE 1",
    ecole: "COLLÈGE D'ENSEIGNEMENT GÉNÉRAL",
    contact: "CONTACT : +227 96 59 10 29",
  },
  
  title: {
    text: "BULLETIN DE NOTES DU 1er SEMESTRE",
    fontSize: 14,
    bold: true
  },
  
  matieres: [
    { nom: "Français", coef: 4 },
    { nom: "Anglais", coef: 2 },
    { nom: "Histoire-Géographie", coef: 2 },
    { nom: "Mathématiques", coef: 3 },
    { nom: "Sciences Physiques", coef: 2 },
    { nom: "SVT", coef: 2 },
    { nom: "Éducation Familiale", coef: 1 },
    { nom: "EPS", coef: 1 },
    { nom: "Conduite", coef: 1 }
  ],
  
  tableauHonneur: {
    conduite: ["BIEN", "ASSEZ BIEN", "PASSABLE", "AVERTISSEMENT", "BLÂME"],
    travail: ["BIEN", "ASSEZ BIEN", "PASSABLE", "AVERTISSEMENT", "BLÂME"],
    options: ["Non Inscrit", "Inscrit", "Félicitations", "Encouragements"]
  }
};

module.exports = BULLETIN_CONFIG;