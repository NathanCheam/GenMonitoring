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
    this.dataSource = new DataSourceAsyncro(this.IntercosService);

    // Récupérer les données depuis localStorage
    const donneesSauvegardees = localStorage.getItem('donnees_sauvegardees');
    const nomService = localStorage.getItem('nom_service');
    const urlInterco = localStorage.getItem('url_interco');

    if (donneesSauvegardees && nomService && urlInterco) {
      this.donneesSauvegardees = JSON.parse(donneesSauvegardees);
      this.serviceChoisi = nomService;
      this.selectedIntercoUrl = urlInterco;

      // Initialiser le dataSource avec les données stockées
      if (this.dataSource) {
        this.dataSource.updateData(this.donneesSauvegardees);
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

  ongletActif: 'liste' | 'graphiques' = 'liste';

  changerOnglet(onglet: 'liste' | 'graphiques') {
    this.ongletActif = onglet;

    if (onglet === 'graphiques') {
      setTimeout(() => {
        if (this.donneesFiltrees) {
          this.generer_graphe(this.donneesFiltrees);
          if(!this.dateFin){
            this.creerGraphiqueOKKO(this.donneesFiltrees, 'line');
          }
        } else {
          this.generer_graphe();
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

  dateDebut: string = '';
  dateFin: string = '';

  chercher_releves_date() {
    if (!this.dateDebut) {
      return;
    }

    let donneesFiltrees: any[] = [];

    if( !this.dateFin) {
      const dateSelectionnee = new Date(this.dateDebut);
      const dateFormatee = dateSelectionnee.toISOString().split('T')[0];

      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemDate = item.datetime.split('T')[0];
        return itemDate === dateFormatee;
      });

      if (this.sortStateMatching[this.sortState] === 0) {
        donneesFiltrees.sort((a, b) => a.datetime.localeCompare(b.datetime));
      } else {
        donneesFiltrees.sort((a, b) => b.datetime.localeCompare(a.datetime));
      }

    } else {
      const dateSelectionneeD = new Date(this.dateDebut);
      const dateFormateeD = dateSelectionneeD.toISOString().split('T')[0];
      const dateSelectionneeF = new Date(this.dateFin);
      const dateFormateeF = dateSelectionneeF.toISOString().split('T')[0];

      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemDate = item.datetime.split('T')[0];
        return itemDate >= dateFormateeD && itemDate <= dateFormateeF;
      });

      if (this.sortStateMatching[this.sortState] === 0) {
        donneesFiltrees.sort((a, b) => a.datetime.localeCompare(b.datetime));
      } else {
        donneesFiltrees.sort((a, b) => b.datetime.localeCompare(a.datetime));
      }
    }
    if (this.dataSource) {
      this.dataSource.updateData(donneesFiltrees);
      if (this.ongletActif === 'graphiques') {
        setTimeout(() => {
          this.generer_graphe(donneesFiltrees);
          if(!this.dateFin){
            this.creerGraphiqueOKKO(donneesFiltrees, 'line');
            console.log(`Graphe OK/KO généré`);
          }
        }, 50);
      } else {
        this.donneesFiltrees = donneesFiltrees;
      }
    }
  }

  filterParStatus(status: boolean) {
    let donneesFiltrees: any[];

    if(!this.dateDebut && !this.dateFin){

      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemStatus = item.status;
        return itemStatus === status;
      });

    }else if(this.dateDebut && this.dateFin) {

      const dateSelectionneeD = new Date(this.dateDebut);
      const dateFormateeD = dateSelectionneeD.toISOString().split('T')[0];
      const dateSelectionneeF = new Date(this.dateFin);
      const dateFormateeF = dateSelectionneeF.toISOString().split('T')[0];

      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemStatus = item.status;
        const itemDate = item.datetime.split('T')[0];
        return itemStatus === status && itemDate >= dateFormateeD && itemDate <= dateFormateeF;
      });

    }else{
      const dateSelectionnee = new Date(this.dateDebut);
      const dateFormatee = dateSelectionnee.toISOString().split('T')[0];

      donneesFiltrees = this.donneesSauvegardees.filter(item => {
        const itemStatus = item.status;
        const itemDate = item.datetime.split('T')[0];
        return itemStatus === status && itemDate === dateFormatee;
      });
    }

    if (this.sortStateMatching[this.sortState] === 0) {
      donneesFiltrees.sort((a, b) => a.datetime.localeCompare(b.datetime));
    } else {
      donneesFiltrees.sort((a, b) => b.datetime.localeCompare(a.datetime));
    }

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
    if (!this.dataSource) return;

    if (!donneesParam || donneesParam.length === 0) return;

    let pourcentageTrue : number = donneesParam.filter(item => item.status === true).length * 100 / donneesParam.length;
    let pourcentageFalse : number = donneesParam.filter(item => item.status === false).length * 100 / donneesParam.length;

    pourcentageTrue = pourcentageTrue - (pourcentageTrue % 1);
    pourcentageFalse = pourcentageFalse - (pourcentageFalse % 1);

    const donnees = [pourcentageTrue, pourcentageFalse];

    console.log("Générations des graphes");

    this.creerGraphiqueDonut(donnees, 'doughnut');
    console.log(`Graphe en donut généré`);
  }

  creerGraphiqueDonut(donnees: number[], type: ChartType) {
    const ctx = document.getElementById(`${type}-chart`) as HTMLCanvasElement;

    if (this.chartInstances[type]) {
      this.chartInstances[type]?.destroy();
    }

    this.chartInstances[type] = new Chart(ctx, {
      type: type,
      data: {
        labels: ['Disponible', 'Indisponible'],
        datasets: [{
          label: 'Pourcentage',
          data: donnees,
          backgroundColor: [
            'rgba(75,192,91,0.2)',
            'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [
            'rgb(75,192,94)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            // L'index 0 correspond à "Disponible" (true), l'index 1 à "Indisponible" (false)
            const statusIndex = elements[0].index;
            const statusValue = statusIndex === 0; // true pour Disponible, false pour Indisponible

            this.ongletActif = 'liste';
            this.filterParStatus(statusValue);
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            font: {
                size: 20,
            },
            text: !this.dateDebut &&!this.dateFin ?
                `Proportion des status relevés par l'interco` :
                (!this.dateFin ?
                `Proportion des status relevés par l'interco le ${this.formatDateGraphe(this.dateDebut)}` :
                `Proportion des status relevés par l'interco du ${this.formatDateGraphe(this.dateDebut)} au ${this.formatDateGraphe(this.dateFin)}`
                )
          },
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

    if (this.chartInstances[type]) {
      this.chartInstances[type]?.destroy();
    }

    this.chartInstances[type] = new Chart(ctx, {
      type: type,
      data: {
        labels: donneesParam.map(item => item.datetime.split('T')[1]?.substring(0, 2) + 'H'),
        datasets: [{
          label: 'Status',
          data: donneesParam.map(item => item.status ? 1 : 0),
          backgroundColor: 'transparent',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 4,
          fill: true,        // Active le remplissage pour créer une aire
          stepped: 'before', // Crée l'effet d'escalier avec des segments horizontaux
          tension: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
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
        scales: {
          y: {
            beginAtZero: true,
            min : 0,
            max : 1,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value === 1 ? 'OK' : 'KO';
              }
            }
          }
        }
      }
    });
  }
}
