import {Component, inject, OnInit} from '@angular/core';
import {DepartementsTemperaturesService} from '../../../services/departementsTemperatures.service';
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
import {DataSourceAsyncro} from '../../../models/departements/data-source-asyncro';
import { DatePipe } from '@angular/common';
import {Chart, ChartType} from "chart.js";
import {FormsModule} from "@angular/forms";

type SortStateKey = 'departement_asc' | 'departement_desc' | 'datetime_asc' | 'datetime_desc';

@Component({
  selector: 'app-departements-t',
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

    ],
    templateUrl: './departements-t.component.html',
    styleUrl: './departements-t.component.css',
    providers: [DatePipe]
})
export class DepartementsTComponent implements OnInit {
    departementsTemperaturesService = inject(DepartementsTemperaturesService);
    route = inject(ActivatedRoute);
    displayedColumns: string[] = ['metrique', 'datetime', 'valeur', 'choisi'];
    dataSource?: DataSourceAsyncro;

    private sortStateMatching = {
        'departement_asc': 0,
        'departement_desc': 1,
        'datetime_asc': 2,
        'datetime_desc': 3
    }

    sortStateDept: SortStateKey = 'departement_asc';
    sortStateDatetime: SortStateKey = 'datetime_asc';

    constructor(private datePipe: DatePipe) {}

    colonneTriee: 'departement' | 'datetime' = 'departement';

    trierDepartement() {
        this.colonneTriee = 'departement';
        if (this.sortStateDept === 'departement_asc') {
            this.sortStateDept = 'departement_desc';
        } else {
            this.sortStateDept = 'departement_asc';
        }

        if (this.dataSource) {
            this.dataSource.setData(this.sortStateMatching[this.sortStateDept], this.sortStateMatching[this.sortStateDatetime], this.colonneTriee);
        }
    }

    trierDatetime() {
        this.colonneTriee = 'datetime';
        if (this.sortStateDatetime === 'datetime_asc') {
            this.sortStateDatetime = 'datetime_desc';
        } else {
            this.sortStateDatetime = 'datetime_asc';
        }

        if (this.dataSource) {
            this.dataSource.setData(this.sortStateMatching[this.sortStateDept], this.sortStateMatching[this.sortStateDatetime], this.colonneTriee);
        }
    }

    router = inject(Router);


    ngOnInit() {
        this.dataSource = new DataSourceAsyncro(this.departementsTemperaturesService);

        this.dataSource.setData(this.sortStateMatching[this.sortStateDept], this.sortStateMatching[this.sortStateDatetime]);

        this.route.queryParamMap.subscribe(() => {
            if (this.dataSource) {
                this.dataSource.setData(this.sortStateMatching[this.sortStateDept], this.sortStateMatching[this.sortStateDatetime]);
            }
        });

        this.dataSource.connect().subscribe(departements => {
            departements.forEach(dept => {
                dept.choisi = true;
            });
        });
    }

    ongletActif: 'liste' | 'graphiques' = 'liste';

    changerOnglet(onglet: 'liste' | 'graphiques') {
        this.ongletActif = onglet;

        // Uniquement besoin de générer les graphiques quand on passe à cet onglet
        if (onglet === 'graphiques') {
            setTimeout(() => {
                this.generer_grapheO();
            }, 50);
        }
    }

    searchTerm: string = '';
    departementsComplets: any[] = [];

    // Méthode principale pour filtrer la liste des départements selon le terme de recherche
    filtrerDepartements() {
        // Vérification de la présence de la source de données, sortie si absente
        if (!this.dataSource) return;

        // Vérifie si la liste complète des départements n'est pas encore chargée
        if (this.departementsComplets.length === 0) {
            // Connexion à la source de données pour récupérer tous les départements
            this.dataSource.connect().subscribe(departements => {
                // Sauvegarde d'une copie complète des départements pour référence future
                this.departementsComplets = [...departements];
                // Application du filtre de recherche sur la liste récupérée
                this.appliquerFiltre();
            });
        } else { // Si la liste complète est déjà disponible
            // Vérification si le champ de recherche est vide
            if (!this.searchTerm.trim()) {
                // Réinitialisation de l'affichage avec tous les départements sans filtrage
                this.dataSource.updateData(this.departementsComplets);
            } else {
                // Application du filtre si un terme de recherche est présent
                this.appliquerFiltre();
            }
        }
    }

// Indicateur pour éviter les appels multiples simultanés au filtrage
    private estEnCoursDeRechargement = false;

// Méthode privée qui effectue le filtrage réel des données selon le terme de recherche
    private appliquerFiltre() {
        // Vérification pour éviter les appels multiples simultanés
        if (this.estEnCoursDeRechargement) return;

        // Activation du drapeau de verrouillage pour empêcher d'autres appels
        this.estEnCoursDeRechargement = true;

        // Utilisation d'un bloc try pour garantir la réinitialisation du drapeau quoi qu'il arrive
        try {
            // Si le champ de recherche est vide
            if (!this.searchTerm.trim()) {
                // Si la liste complète des départements est disponible
                if (this.departementsComplets.length > 0) {
                    // Destruction des graphiques existants pour éviter les conflits visuels
                    Object.values(this.chartInstances).forEach(chart => {
                        // Destruction de chaque instance de graphique si elle existe
                        if (chart) chart.destroy();
                    });

                    // Rechargement des données avec les paramètres de tri actuels
                    if (this.dataSource) {
                        // Mise à jour des données dans la source avec les options de tri actuelles
                        this.dataSource.setData(
                            this.sortStateMatching[this.sortStateDept],
                            this.sortStateMatching[this.sortStateDatetime],
                            this.colonneTriee
                        );

                        // Si l'utilisateur est actuellement sur l'onglet graphiques
                        if (this.ongletActif === 'graphiques') {
                            // Régénération des graphiques avec un délai pour assurer le rendu DOM
                            setTimeout(() => this.generer_grapheO(), 100);
                        }
                    }
                } else {
                    // Cas où la liste complète n'est pas disponible mais la recherche est vide
                    this.dataSource!.connect().subscribe(departements => {
                        // Sauvegarde de la liste complète pour usage futur
                        this.departementsComplets = [...departements];
                        // Mise à jour de l'affichage avec tous les départements
                        this.dataSource!.updateData(this.departementsComplets);
                    });
                }
            } else {
                // Cas où un terme de recherche est présent
                // Transformation du terme en minuscules et suppression des espaces inutiles
                const termeRecherche = this.searchTerm.toLowerCase().trim();
                // Filtrage des départements dont le nom contient le terme de recherche
                const resultatsFiltres = this.departementsComplets.filter(dept =>
                    dept.metrique.toLowerCase().includes(termeRecherche)
                );
                // Mise à jour de l'affichage avec les résultats filtrés
                this.dataSource!.updateData(resultatsFiltres);
            }

            // Si l'utilisateur est sur l'onglet graphiques, régénérer les visualisations
            if (this.ongletActif === 'graphiques') {
                this.generer_grapheO();
            }
        } finally {
            // Bloc finally pour garantir que le drapeau sera réinitialisé même en cas d'erreur
            // Réinitialisation du drapeau après un délai pour éviter les appels rapides multiples
            setTimeout(() => {
                this.estEnCoursDeRechargement = false;
            }, 200);
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

    types: ChartType[] = ['line', 'bar', 'doughnut'];

    date: string = new Date().toISOString().split('T')[0];

    generer_grapheO() {
        // Vérification de l'existence de la source de données
        if (!this.dataSource) return;

        // Connexion au flux de données pour obtenir les départements
        this.dataSource.connect().subscribe(departements => {
            // Vérification que des départements existent
            if (!departements || departements.length === 0) return;

            // Récupération uniquement des départements dont la case est cochée
            const departementsCoches = departements.filter(dept => dept.choisi);

            // Si aucun département n'est coché, utilise tous les départements
            if (departementsCoches.length === 0) {
                departementsCoches.push(...departements);
            }

            // Transformation des données brutes en format adapté aux graphiques
            const donnees = departementsCoches.map(dept => {
                return {
                    nom: dept.metrique,           // Nom du département
                    valeur: dept.valeur,          // Température relevée
                    datetime: this.formatDate(new Date(dept.datetime)), // Date formatée
                };
            });

            // Log de débogage indiquant le début de la génération sur la console du navigateur internet
            console.log("Générations des graphes");

            // Pour chaque type de graphique configuré (line, bar, doughnut)
            this.types.forEach(type => {
                // Création du graphique avec les données préparées
                this.creerGraphiqueO(donnees, type);
                // Confirmation de la génération dans la console
                console.log(`Graphe ${type} généré`);
            });
        });
    }

    protected formatDate(date: string | Date): string {
        if (!date) return '';
        return this.datePipe.transform(date, 'le dd/MM/yyyy à HH:mm:ss') || '';
    }

    private creerGraphiqueO(donnees: any[], typeGraphe: ChartType) {
        // Récupération du contexte HTML5 Canvas nécessaire pour Chart.js
        const ctx = document.getElementById(`${typeGraphe}-chart`) as HTMLCanvasElement;
        if (!ctx) return; // Sortie anticipée si le canvas n'est pas trouvé dans le DOM

        // Nettoyage de tout graphique existant sur ce canvas pour éviter les superpositions
        if (this.chartInstances[typeGraphe]) {
            this.chartInstances[typeGraphe]!.destroy();
        }

        // Configuration des options du graphique
        let options: any = {
            responsive: true,
            plugins: {
                // Configuration avancée des infobulles pour afficher des informations contextuelles
                tooltip: {
                    callbacks: {
                        // Personnalisation du titre de l'infobulle avec le nom du département
                        title: (tooltipItems: any) => `Département : ${tooltipItems[0].label}`,

                        // Affichage de la température avec formatage à une décimale
                        label: (tooltipItem: any) =>
                            `Température : ${tooltipItem.parsed.y?.toFixed(1) ||
                            tooltipItem.parsed?.toFixed(1)} degrés`,

                        // Ajout d'une ligne supplémentaire pour les informations temporelles
                        afterLabel: (tooltipItem: any) => {
                            const index = tooltipItem.dataIndex;
                            return `Date et Heure : ${donnees[index].datetime}`;
                        }
                    }
                },
                // Configuration de la légende pour améliorer la lisibilité du graphique
                legend: {
                    display: true,     // Afficher la légende
                    position: 'top'    // Positionner en haut pour optimiser l'espace vertical
                }
            }
        };

        // Ajout d'options spécifiques selon le type de graphique
        if (typeGraphe !== 'doughnut') {
            options.scales = {
                y: {
                    beginAtZero: true, // Commencer l'axe Y à zéro pour une meilleure interprétation des données
                    title: {
                        display: true,
                        text: 'Température (en degré)'  // Indication claire de l'unité de mesure
                    }
                }
            };
        }

        // Instanciation finale du graphique avec Chart.js
        // Cette étape combine les données préparées et les options configurées
        this.chartInstances[typeGraphe] = new Chart(ctx, {
            type: typeGraphe,
            data: {
                // Extraction des noms de départements pour les libellés du graphique
                labels: donnees.map(d => d.nom),
                datasets: [{
                    label: `Températures par département`,  // Titre du jeu de données
                    data: donnees.map(d => d.valeur),       // Extraction des valeurs de température
                    // Palette de couleurs pour différencier les départements
                    backgroundColor: [
                        'rgba(141,145,166,0.6)',
                        'rgba(255,99,132,0.6)',
                        'rgba(54,162,235,0.6)',
                        'rgba(255,206,86,0.6)',
                        'rgba(75,192,192,0.6)',
                        'rgba(153,102,255,0.6)'
                    ],
                    borderColor: 'rgb(106,108,119)',  // Couleur de bordure uniforme pour l'harmonie
                    borderWidth: 2,                   // Épaisseur suffisante pour la lisibilité
                }]
            },
            options: options  // Application des options configurées précédemment
        });
    }
}
