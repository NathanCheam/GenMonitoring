import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ChartService} from '../../../services/chart.service';
import {FormsModule} from '@angular/forms';
import {Chart, ChartType, registerables} from 'chart.js';
Chart.register(...registerables);
import {ActivatedRoute} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';

interface DepartementEx {
  id: number;
  nom: string;
  coche: boolean;
  temperature1?: TemperatureEx;
  temperature2?: TemperatureEx;
  temperature3?: TemperatureEx;
  temperature4?: TemperatureEx;
}

interface TemperatureEx {
  id: number;
  date: Date;
  heure: string;
  valeur: number;
  idDepartement: number;
}

interface TemperatureEx2 {
  heure: string;
  valeur: number;
}

@Component({
  selector: 'app-exercicedetails',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
  ],
  templateUrl: './exercicedetails.component.html',
  styleUrl: './exercicedetails.component.css'
})
export class ExercicedetailsComponent implements OnInit {
  private chartInstance: Chart | null = null;

  departement1: DepartementEx = {
    id: 1,
    nom: 'Pas-de-Calais',
    coche: true,
    temperature1: {
      id: 1,
      date: new Date('2023-10-01'),
      heure: '12:00',
      valeur: 14,
      idDepartement: 1
    },
    temperature2: {
      id: 6,
      date: new Date('2023-10-02'),
      heure: '12:00',
      valeur: 22,
      idDepartement: 1
    },
    temperature3: {
      id: 11,
      date: new Date('2023-10-03'),
      heure: '12:00',
      valeur: 21,
      idDepartement: 1
    }
  }


  departement2: DepartementEx = {
    id: 2,
    nom: 'Nord',
    coche: false,
    temperature1: {
      id: 2,
      date: new Date('2023-10-01'),
      heure: '12:00',
      valeur: 10,
      idDepartement: 1
    },
    temperature2: {
      id: 7,
      date: new Date('2023-10-02'),
      heure: '12:00',
      valeur: 22,
      idDepartement: 1
    },
    temperature3: {
      id: 12,
      date: new Date('2023-10-03'),
      heure: '12:00',
      valeur: 21,
      idDepartement: 1
    }
  }

  departement3: DepartementEx = {
    id: 3,
    nom: 'Ardèche',
    coche: true,
    temperature1: {
      id: 3,
      date: new Date('2023-10-01'),
      heure: '12:00',
      valeur: 20,
      idDepartement: 1
    },
    temperature2: {
      id: 8,
      date: new Date('2023-10-02'),
      heure: '12:00',
      valeur: 15,
      idDepartement: 1
    },
    temperature3: {
      id: 13,
      date: new Date('2023-10-03'),
      heure: '12:00',
      valeur: 19,
      idDepartement: 1
    }
  }

  departement4: DepartementEx = {
    id: 4,
    nom: 'Hautes-Alpes',
    coche: true,
    temperature1: {
      id: 4,
      date: new Date('2023-10-01'),
      heure: '12:00',
      valeur: 20,
      idDepartement: 1
    },
    temperature2: {
      id: 9,
      date: new Date('2023-10-02'),
      heure: '12:00',
      valeur: 10,
      idDepartement: 1
    },
    temperature3: {
      id: 14,
      date: new Date('2023-10-03'),
      heure: '12:00',
      valeur: 17,
      idDepartement: 1
    }
  }

  departement5: DepartementEx = {
    id: 5,
    nom: 'Vosges',
    coche: false,
    temperature1: {
      id: 5,
      date: new Date('2023-10-01'),
      heure: '12:00',
      valeur: 5,
      idDepartement: 1
    },
    temperature2: {
      id: 10,
      date: new Date('2023-10-02'),
      heure: '12:00',
      valeur: 12,
      idDepartement: 1
    },
    temperature3: {
      id: 15,
      date: new Date('2023-10-03'),
      heure: '12:00',
      valeur: 21,
      idDepartement: 1
    },
    temperature4: {
      id: 15,
      date: new Date('2023-10-03'),
      heure: '18:00',
      valeur: 12,
      idDepartement: 1
    }
  }

  types: ChartType[] = ['line', 'bar', 'doughnut'];

  selectionne: ChartType = 'line';

  departementNom: string = '';

  date: string = '';

  constructor(private chart: ChartService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.departementNom = params['nom'] || '';
      this.date = params['date'] || '';
    });
    this.generer_graphe(/*this.departementNom, this.date*/);
  }

  generer_graphe(/*departementDonnee: String, dateDonnee: String*/) {

    const departements = [
      this.departement1,
      this.departement2,
      this.departement3,
      this.departement4,
      this.departement5
    ];

    const departement = departements.find(dept => dept.nom === this.departementNom);

    if (!departement) {
      return;
    }

    const temperatures: TemperatureEx2[] = [];

    if (departement.temperature1 && this.formatDate(departement.temperature1.date) === this.date) {
      temperatures.push({
        heure: departement.temperature1.heure,
        valeur: departement.temperature1.valeur
      });
    }

    if (departement.temperature2 && this.formatDate(departement.temperature2.date) === this.date) {
      temperatures.push({
        heure: departement.temperature2.heure,
        valeur: departement.temperature2.valeur
      });
    }

    if (departement.temperature3 && this.formatDate(departement.temperature3.date) === this.date) {
      temperatures.push({
        heure: departement.temperature3.heure,
        valeur: departement.temperature3.valeur
      });
    }

    if (departement.temperature4 && this.formatDate(departement.temperature4.date) === this.date) {
      temperatures.push({
        heure: departement.temperature4.heure,
        valeur: departement.temperature4.valeur
      });
    }

    this.creerGraphique(temperatures, this.selectionne);
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }


  private creerGraphique(temperatures: TemperatureEx2[], typeGraphe: ChartType) {
    const ctx = document.getElementById(`${this.selectionne}-chart`) as HTMLCanvasElement;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: this.selectionne,
      data: {
        labels: temperatures.map(t => t.heure),
        datasets: [{
          label: `Températures pour ${this.departementNom} le ${this.date}`,
          data: temperatures.map(t => t.valeur),
          backgroundColor: 'rgba(141,145,166,0.6)',
          borderColor: 'rgb(106,108,119)',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                return `Heure: ${tooltipItems[0].label}`;
              },
              label: (tooltipItem) => {
                return `Température: ${tooltipItem.parsed.y} degrés`;
              },
              afterLabel: () => {
                return `Département: ${this.departementNom}`;
              }
            },
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Température (en degré)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Heure'
            }
          }
        }
      }
    });
  }
}
