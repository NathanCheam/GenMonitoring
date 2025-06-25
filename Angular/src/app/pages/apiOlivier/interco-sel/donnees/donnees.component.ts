import {Component, inject, OnInit} from '@angular/core';
import {IntercosService} from '../../../../services/intercos.service';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {ActivatedRoute, Router} from '@angular/router';
import {DataSourceAsyncro} from '../../../../models/intercos/data-source-asyncro';
import { DatePipe } from '@angular/common';
import {Chart, ChartType} from "chart.js";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";

type SortStateKey = 'datetime_asc' | 'datetime_desc';

@Component({
  selector: 'app-Donnees',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    FormsModule,
    MatIcon,
    MatButton,

  ],
  templateUrl: './donnees.component.html',
  styleUrl: './donnees.component.css',
  providers: [DatePipe]
})
export class DonneesComponent implements OnInit {
  IntercosService = inject(IntercosService);
  route = inject(ActivatedRoute);
  displayedColumns: string[] = ['datetime', 'status'];
  dataSource?: DataSourceAsyncro;

  private sortStateMatching = {
    'datetime_asc': 0,
    'datetime_desc': 1,
  }

  sortState: SortStateKey = 'datetime_asc';
  donneesFiltrees: any[] | null = null;

  constructor(private datePipe: DatePipe, ) {}

  trierDatetime() {
    if (this.sortState === 'datetime_asc') {
      this.sortState = 'datetime_desc';
    } else {
      this.sortState = 'datetime_asc';
    }

    if (this.dataSource) {
      this.dataSource.setDataDonnees(this.sortStateMatching[this.sortState], this.selectedIntercoUrl);
    }
  }

  router = inject(Router);

  selectedIntercoUrl: string = '';

  serviceChoisi: string = '';

  donneesSauvegardees: any[] = [];

  ngOnInit() {
    // Initialiser la source de données
    this.dataSource = new DataSourceAsyncro(this.IntercosService);

    // Récupérer les données depuis localStorage
    const donneesSauvegardees = localStorage.getItem('donnees_sauvegardees');
    const nomService = localStorage.getItem('nom_service');
    const urlInterco = localStorage.getItem('url_interco');

    if (donneesSauvegardees && nomService && urlInterco) {// Si les données sont disponibles
      // Convertir les données JSON du localStorage en tableau d'objets
      this.donneesSauvegardees = JSON.parse(donneesSauvegardees);
      // Mettre à jour la source de données avec les données sauvegardées
      this.serviceChoisi = nomService;
      this.selectedIntercoUrl = urlInterco;

      // Initialiser le dataSource avec les données stockées
      if (this.dataSource) {
        // Mettre à jour la source de données avec les données sauvegardées
        this.dataSource.updateData(this.donneesSauvegardees);
        // Générer le graphique avec les données sauvegardées
        this.generer_graphe(this.donneesSauvegardees);
      }
    } else {
      // Fallback : récupérer des paramètres d'URL si disponibles
      this.route.queryParamMap.subscribe(params => {
        this.serviceChoisi = params.get('nom') ?? '';
        // Autres logiques si nécessaire...
      });
    }
  }

  // Onglet actif pour la navigation entre liste et graphiques
  ongletActif: 'liste' | 'graphiques' = 'liste';

  changerOnglet(onglet: 'liste' | 'graphiques') {
    // Vérifier si onglet est déjà actif
    this.ongletActif = onglet;
    // Si l'onglet est 'graphiques', générer le graphe avec les données filtrées ou sauvegardées
    if (onglet === 'graphiques') {
      setTimeout(() => {
        if (this.donneesFiltrees) {// Si des données filtrées sont disponibles
          this.generer_graphe(this.donneesFiltrees);// Générer le graphe en donut avec les données filtrées
          if(!this.dateFin){// Si aucune date de fin n'est spécifiée
            this.creerGraphiqueOKKO(this.donneesFiltrees, 'line');// Créer en plus le graphique OK/KO avec les données filtrées
          }
        } else {
          this.generer_graphe();// Sinon, générer qu'un graphe en donut avec la totalité des données
        }
      }, 50);
    }
  }

  protected formatDate(date: string): string {
    if (!date) return '';
    const dateUTC = new Date(date);
    return this.datePipe.transform(dateUTC, 'le dd/MM/yyyy à HH:mm:ss', 'UTC') || '';
  }

  protected formatDateGraphe(date: string): string {
    if (!date) return '';
    const dateUTC = new Date(date);
    return this.datePipe.transform(dateUTC, 'dd/MM/yyyy', 'UTC') || '';
  }

  // Variables pour la sélection des dates
  dateDebut: string = '';
  dateFin: string = '';

  chercher_releves_date() {
    //Si aucune date de début n'est sélectionnée, on ne fait rien
    if (!this.dateDebut) {
      return;
    }

    //Création d'un tableau pour stocker les données filtrées
    let donneesFiltrees: any[] = [];

    if( !this.dateFin) { // Si aucune date de fin n'est sélectionnée, on filtre uniquement par date de début
      const dateSelectionnee = new Date(this.dateDebut);
      const dateFormatee = dateSelectionnee.toISOString().split('T')[0];

      // Filtrer les données sauvegardées par la date sélectionnée
      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemDate = item.datetime.split('T')[0];
        return itemDate === dateFormatee;
      });

      // Trier les données filtrées par date
      if (this.sortStateMatching[this.sortState] === 0) {
        // Si l'état de tri est ascendant, trier par ordre croissant
        donneesFiltrees.sort((a, b) => a.datetime.localeCompare(b.datetime));
      } else {
        // Si l'état de tri est descendant, trier par ordre décroissant
        donneesFiltrees.sort((a, b) => b.datetime.localeCompare(a.datetime));
      }

    } else {
      // Si une date de fin est sélectionnée, on filtre par la plage de dates
      const dateSelectionneeD = new Date(this.dateDebut);
      const dateFormateeD = dateSelectionneeD.toISOString().split('T')[0];
      const dateSelectionneeF = new Date(this.dateFin);
      const dateFormateeF = dateSelectionneeF.toISOString().split('T')[0];
      // Filtrer les données sauvegardées par la plage de dates sélectionnée
      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemDate = item.datetime.split('T')[0];
        return itemDate >= dateFormateeD && itemDate <= dateFormateeF;
      });
      // Trier les données filtrées par date
      if (this.sortStateMatching[this.sortState] === 0) {
        // Si l'état de tri est ascendant, trier par ordre croissant
        donneesFiltrees.sort((a, b) => a.datetime.localeCompare(b.datetime));
      } else {
        // Si l'état de tri est descendant, trier par ordre décroissant
        donneesFiltrees.sort((a, b) => b.datetime.localeCompare(a.datetime));
      }
    }
    // Afficher le nombre de relevés trouvés
    if (this.dataSource) {
      // Mettre à jour la source de données avec les données filtrées
      this.dataSource.updateData(donneesFiltrees);
      // Générer le graphe si l'onglet actif est 'graphiques' avec les données filtrées
      if (this.ongletActif === 'graphiques') {
        setTimeout(() => {
          this.generer_graphe(donneesFiltrees);
          if(!this.dateFin){
            this.creerGraphiqueOKKO(donneesFiltrees, 'line');
            console.log(`Graphe OK/KO généré`);
          }
        }, 50);
      } else {
        // Si l'onglet actif est 'liste', mettre à jour les données filtrées
        this.donneesFiltrees = donneesFiltrees;
      }
    }
  }

  filterParStatus(status: boolean) {
    // Inistialiser un tableau pour stocker les données filtrées
    let donneesFiltrees: any[];

    // Si aucune date de début et de fin n'est sélectionnée, on filtre uniquement par status
    if(!this.dateDebut && !this.dateFin){

      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemStatus = item.status;
        return itemStatus === status;
      });

    }else if(this.dateDebut && this.dateFin) {
    // Si une date de début et une date de fin sont sélectionnées, on filtre par status et plage de dates
      const dateSelectionneeD = new Date(this.dateDebut);
      const dateFormateeD = dateSelectionneeD.toISOString().split('T')[0];
      const dateSelectionneeF = new Date(this.dateFin);
      const dateFormateeF = dateSelectionneeF.toISOString().split('T')[0];

        // Filtrer les données sauvegardées par le status et la plage de dates sélectionnée
      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemStatus = item.status;
        const itemDate = item.datetime.split('T')[0];
        return itemStatus === status && itemDate >= dateFormateeD && itemDate <= dateFormateeF;
      });

    }else{
    // Si une date de début est sélectionnée mais pas de date de fin, on filtre par status et date de début
      const dateSelectionnee = new Date(this.dateDebut);
      const dateFormatee = dateSelectionnee.toISOString().split('T')[0];
    // Filtrer les données sauvegardées par le status et la date sélectionnée
      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemStatus = item.status;
        const itemDate = item.datetime.split('T')[0];
        return itemStatus === status && itemDate === dateFormatee;
      });
    }
    // Trier les données filtrées par date
    if (this.sortStateMatching[this.sortState] === 0) {
      // Si l'état de tri est ascendant, trier par ordre croissant
      donneesFiltrees.sort((a, b) => a.datetime.localeCompare(b.datetime));
    } else {
      // Si l'état de tri est descendant, trier par ordre décroissant
      donneesFiltrees.sort((a, b) => b.datetime.localeCompare(a.datetime));
    }
    // Mettre à jour la source de données avec les données filtrées
    if (this.dataSource) {
      this.dataSource.updateData(donneesFiltrees);
    }

    console.log(`${donneesFiltrees.length} relevés ayant comme état ${this.formatStatus(status)}`);
  }

  arreterFiltrage() {
    if (this.dataSource) {
      this.dataSource.updateData(this.donneesSauvegardees);
      this.dateDebut = '';
      this.dateFin = '';
      console.log("Filtrage arrêté, toutes les données sont affichées.");
    }
    else{
        console.error("DataSource non initialisé, impossible de réinitialiser les données.");
    }
  }

  formatStatus(status: boolean){
    switch (status) {
      case true:
        return 'Disponible';
      case false:
        return 'Indisponible';
      default:
        return 'Aucun résultat';
    }
  }

  toggleActive(event: Event) {
    const target = event.target as HTMLElement;
    if (target.id === "btn_dispo") {
      document.getElementById("btn_indispo")?.classList.remove('btn-active');
      target.classList.add('btn-active');
      console.log("Bouton disponible activé");
    } else if (target.id === "btn_indispo") {
      document.getElementById("btn_dispo")?.classList.remove('btn-active');
      target.classList.add('btn-active');
      console.log("Bouton indisponible activé");
    }
  }

  chartInstances: Record<ChartType, Chart | undefined> = {
    'line': undefined,
    'bar': undefined,
    'doughnut': undefined,
    scatter: undefined,
    bubble: undefined,
    pie: undefined,
    polarArea: undefined,
    radar: undefined
  };

  types: ChartType[] = ['doughnut', 'line'];

  generer_graphe(donneesParam: any[] = this.donneesSauvegardees) {
    // Vérifier si la dataSource est initialisée
    if (!this.dataSource) return;
    // Vérifier si les données sont disponibles
    if (!donneesParam || donneesParam.length === 0) return;
    // Calculer les pourcentages de status
    // Filtrer les données pour obtenir le nombre de true et false
    let pourcentageTrue : number = donneesParam.filter(item => item.status === true).length * 100 / donneesParam.length;
    let pourcentageFalse : number = donneesParam.filter(item => item.status === false).length * 100 / donneesParam.length;

    // Arrondir les pourcentages à l'entier inférieur
    pourcentageTrue = pourcentageTrue - (pourcentageTrue % 1);
    pourcentageFalse = pourcentageFalse - (pourcentageFalse % 1);

    // Intégrer les pourcentages dans un tableau
    const donnees = [pourcentageTrue, pourcentageFalse];
    console.log("Générations des graphes");
    // Créer le graphique en donut avec les données calculées (les pourcentages)
    this.creerGraphiqueDonut(donnees, 'doughnut');
    console.log(`Graphe en donut généré`);
  }

  creerGraphiqueDonut(donnees: number[], type: ChartType) {
    const ctx = document.getElementById(`${type}-chart`) as HTMLCanvasElement;
    // Vérifie si une instance de graphique existe déjà pour ce type et la détruit si c'est le cas
    if (this.chartInstances[type]) {
      this.chartInstances[type]?.destroy();
    }
    // Création d'une nouvelle instance de graphique
    this.chartInstances[type] = new Chart(ctx, {
      type: type, // Définit le type de graphique (donut dans ce cas)
      data: { // Configuration des données à visualiser
        labels: ['Disponible', 'Indisponible'], // Étiquettes pour chaque segment du graphique
        datasets: [{ // Définition du jeu de données à afficher
          label: 'Pourcentage', // Label du jeu de données
          data: donnees, // Valeurs numériques à représenter (pourcentages)
          backgroundColor: [ // Couleurs de remplissage pour chaque segment (vert pour disponible, rouge pour indisponible)
            'rgba(75,192,91,0.2)',
            'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [ // Couleurs des bordures de chaque segment
            'rgb(75,192,94)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1 // Épaisseur des bordures
        }]
      },
      options: { // Options de configuration du graphique
        responsive: true, // Permet au graphique de s'adapter à la taille de son conteneur
        onClick: (event, elements) => {
          // Vérifie si l'utilisateur a cliqué sur un segment du graphique
          if (elements && elements.length > 0) {
            const statusIndex = elements[0].index; // Récupère l'index du segment cliqué (0 = Disponible, 1 = Indisponible)
            const statusValue = statusIndex === 0; // Convertit l'index en valeur booléenne (true pour Disponible, false pour Indisponible)

            this.ongletActif = 'liste'; // Bascule vers l'onglet liste pour afficher les données filtrées
            this.filterParStatus(statusValue); // Applique le filtre correspondant au segment sélectionné
          }
        },
        // Configuration des axes du graphique
        plugins: {
          legend: {
            position: 'top',
          },
          title: { // Configuration du titre dynamique du graphique
            display: true,
            font: {
                size: 20,
            },
            // Titre différent selon les filtres de date appliqués
            text: !this.dateDebut &&!this.dateFin ?
                // Si aucun filtre de date :
                `Proportion des status relevés par l'interco` :
                (!this.dateFin ?
                        // Si filtre sur une date spécifique
                `Proportion des status relevés par l'interco le ${this.formatDateGraphe(this.dateDebut)}` :
                        // Si filtre sur une période
                `Proportion des status relevés par l'interco du ${this.formatDateGraphe(this.dateDebut)} au ${this.formatDateGraphe(this.dateFin)}`
                )
          },
          // Personnalisation des infobulles au survol
          tooltip: {
              callbacks: {
                  label: function(context) {
                    return 'Pourcentage : ' + context.raw + ' %';
                }
              }
          }
        }
      }
    });
  }

  creerGraphiqueOKKO(donneesParam: any[] = this.donneesSauvegardees, type: ChartType) {
    const ctx = document.getElementById(`okko-chart`) as HTMLCanvasElement;
    // Vérifie si une instance de graphique existe déjà pour ce type et la détruit si c'est le cas
    if (this.chartInstances[type]) {
      this.chartInstances[type]?.destroy();
    }
    // Création d'une nouvelle instance de graphique
    this.chartInstances[type] = new Chart(ctx, {
      type: type, // Définit le type de graphique (line dans ce cas)
      data: { // Configuration des données à visualiser
        labels: donneesParam.map(item => item.datetime.split('T')[1]?.substring(0, 2) + 'H'), // Utilise l'heure de chaque relevé comme étiquette
        datasets: [{ // Définition du jeu de données à afficher
          label: 'Status', // Label du jeu de données
          data: donneesParam.map(item => item.status ? 1 : 0), // Convertit les valeurs de status en 1 (Disponible) ou 0 (Indisponible)
          backgroundColor: 'transparent', // Couleur de fond transparente pour l'aire
          borderColor: 'rgba(75, 192, 192, 1)', // Couleur de la ligne du graphique
          borderWidth: 4, // Épaisseur de la ligne
          fill: true,        // Active le remplissage pour créer une aire
          stepped: 'before', // Crée l'effet d'escalier avec des segments horizontaux
          tension: 0 // Tension de la ligne, 0 pour des segments droits
        }]
      },
      options: { // Options de configuration du graphique
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: { // Personnalisation des infobulles au survol
            callbacks: {
              label: function(context) {
                // Affiche le statut sous forme de texte dans l'infobulle
                return 'Status : ' + (context.raw === 1 ? 'Disponible' : 'Indisponible');
              }
            }
          },
          title: {
            display: true,
            font: {
                size: 20,
            },
            text: `L'évolution des status relevés par l'interco le ${this.formatDateGraphe(this.dateDebut)}`
          }
        },
        scales: { // Configuration des axes du graphique
          y: { // Axe Y pour les valeurs de status
            beginAtZero: true, // Commence à zéro
            min : 0, // Valeur minimale de l'axe Y
            max : 1, // Valeur maximale de l'axe Y
            ticks: { // Personnalisation des étiquettes de l'axe Y
              stepSize: 1, // Définit l'intervalle entre les étiquettes
              callback: function(value) {
                // Affiche 'OK' pour 1 et 'KO' pour 0
                return value === 1 ? 'OK' : 'KO';
              }
            }
          }
        }
      }
    });
  }
}
