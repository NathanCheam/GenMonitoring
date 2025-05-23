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

    filtrerDepartements() {
        if (!this.dataSource) return;

        // Toujours s'assurer que nous avons la liste complète
        if (this.departementsComplets.length === 0) {
            this.dataSource.connect().subscribe(departements => {
                this.departementsComplets = [...departements];
                this.appliquerFiltre();
            });
        } else {
            // Si la recherche est vide, réinitialiser l'affichage avec tous les départements
            if (!this.searchTerm.trim()) {
                this.dataSource.updateData(this.departementsComplets);
            } else {
                this.appliquerFiltre();
            }
        }
    }

    // Ajouter cette propriété à votre classe
    private estEnCoursDeRechargement = false;

    private appliquerFiltre() {
        // Si déjà en cours de rechargement, sortir immédiatement
        if (this.estEnCoursDeRechargement) return;

        // Activer le drapeau
        this.estEnCoursDeRechargement = true;

        try {
            if (!this.searchTerm.trim()) {
                // Si la recherche est vide, restaurer la liste complète
                if (this.departementsComplets.length > 0) {
                    Object.values(this.chartInstances).forEach(chart => {
                        if (chart) chart.destroy();
                    });

                    // Recharger les données
                    if (this.dataSource) {
                        this.dataSource.setData(
                            this.sortStateMatching[this.sortStateDept],
                            this.sortStateMatching[this.sortStateDatetime],
                            this.colonneTriee
                        );

                        // Rafraîchir les graphiques si on est sur l'onglet graphiques
                        if (this.ongletActif === 'graphiques') {
                            setTimeout(() => this.generer_grapheO(), 100);
                        }
                    }
                } else {
                    // Charger la liste complète une seule fois
                    this.dataSource!.connect().subscribe(departements => {
                        this.departementsComplets = [...departements];
                        this.dataSource!.updateData(this.departementsComplets);
                    });
                }
            } else {
                // Filtrer les départements selon le terme de recherche
                const termeRecherche = this.searchTerm.toLowerCase().trim();
                const resultatsFiltres = this.departementsComplets.filter(dept =>
                    dept.metrique.toLowerCase().includes(termeRecherche)
                );
                this.dataSource!.updateData(resultatsFiltres);
            }

            if (this.ongletActif === 'graphiques') {
                this.generer_grapheO();
            }
        } finally {
            // Réinitialiser le drapeau après un court délai
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
        if (!this.dataSource) return;

        this.dataSource.connect().subscribe(departements => {
            if (!departements || departements.length === 0) return;

            const departementsCoches = departements.filter(dept => dept.choisi);

            if (departementsCoches.length === 0) {
                departementsCoches.push(...departements);
            }

            const donnees = departementsCoches.map(dept => {
                return {
                    nom: dept.metrique,
                    valeur: dept.valeur,
                    datetime: this.formatDate(new Date(dept.datetime)),
                };
            });

            console.log("Générations des graphes");

            this.types.forEach(type => {
                this.creerGraphiqueO(donnees, type);
                console.log(`Graphe ${type} généré`);
            });
        });
    }

    protected formatDate(date: string | Date): string {
        if (!date) return '';
        return this.datePipe.transform(date, 'le dd/MM/yyyy à HH:mm:ss') || '';
    }

    private creerGraphiqueO(donnees: any[], typeGraphe: ChartType) {
        const ctx = document.getElementById(`${typeGraphe}-chart`) as HTMLCanvasElement;
        if (!ctx) return;

        if (this.chartInstances[typeGraphe]) {
            this.chartInstances[typeGraphe]!.destroy();
        }

        let options: any = {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (tooltipItems: any) => {
                            return `Département : ${tooltipItems[0].label}`;
                        },
                        label: (tooltipItem: any) => {
                            return `Température : ${tooltipItem.parsed.y?.toFixed(1) || tooltipItem.parsed?.toFixed(1)} degrés`;
                        },
                        afterLabel: (tooltipItem: any) => {
                            const index = tooltipItem.dataIndex;
                            const dateTime = donnees[index].datetime;
                            return `Date et Heure : ${dateTime}`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        };

        if (typeGraphe !== 'doughnut') {
            options.scales = {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Température (en degré)'
                    }
                }
            };
        }

        this.chartInstances[typeGraphe] = new Chart(ctx, {
            type: typeGraphe,
            data: {
                labels: donnees.map(d => d.nom),
                datasets: [{
                    label: `Températures par département`,
                    data: donnees.map(d => d.valeur),
                    backgroundColor: [
                        'rgba(141,145,166,0.6)',
                        'rgba(255,99,132,0.6)',
                        'rgba(54,162,235,0.6)',
                        'rgba(255,206,86,0.6)',
                        'rgba(75,192,192,0.6)',
                        'rgba(153,102,255,0.6)'
                    ],
                    borderColor: 'rgb(106,108,119)',
                    borderWidth: 2,
                }]
            },
            options: options
        });


    }
}
