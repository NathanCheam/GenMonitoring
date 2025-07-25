import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ChartService} from '../../services/chart.service';
import {MatButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {Chart, ChartType, registerables} from 'chart.js';
import {MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {Router} from '@angular/router';
Chart.register(...registerables);

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

@Component({
  selector: 'app-exercice',
  imports: [
    MatButton,
    FormsModule,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect
  ],
  templateUrl: './exercice.component.html',
  styleUrl: './exercice.component.css'
})
export class ExerciceComponent {

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

  date: string = '2023-10-01';

  types: ChartType[] = ['line', 'bar', 'doughnut'];

  selectionne: ChartType = 'line';

  constructor(private chart: ChartService, private router: Router) {
  }

  generer_graphe() {
    const dateSelectionnee = new Date(this.date);
    const dateFormatee = dateSelectionnee.toISOString().split('T')[0];

    const departements = [
      this.departement1,
      this.departement2,
      this.departement3,
      this.departement4,
      this.departement5
    ].filter(dept => dept.coche);

    const donnees = departements.map(dept => {
      const temperatures = [];
      if (dept.temperature1 && this.formatDate(dept.temperature1.date) === dateFormatee) {
        temperatures.push(dept.temperature1.valeur);
      }
      if (dept.temperature2 && this.formatDate(dept.temperature2.date) === dateFormatee) {
        temperatures.push(dept.temperature2.valeur);
      }
      if (dept.temperature3 && this.formatDate(dept.temperature3.date) === dateFormatee) {
        temperatures.push(dept.temperature3.valeur);
      }
      if (dept.temperature4 && this.formatDate(dept.temperature4.date) === dateFormatee) {
        temperatures.push(dept.temperature4.valeur);
      }

      const moyenne = temperatures.length > 0
        ? temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length
        : 0;

      return {
        nom: dept.nom,
        moyenne: moyenne
      };
    });

    this.creerGraphique(donnees, this.selectionne);
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private creerGraphique(donnees: any[], typeGraphe: ChartType) {
    const ctx = document.getElementById(`${typeGraphe}-chart`) as HTMLCanvasElement;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: typeGraphe,
      data: {
        labels: donnees.map(d => d.nom),
        datasets: [{
          label: `Températures moyennes du ${this.date}`,
          data: donnees.map(d => d.moyenne),
          backgroundColor: 'rgba(141,145,166,0.6)',
          borderColor: 'rgb(106,108,119)',
          borderWidth: 2,
        }]
      },
      options: {
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const departementNom = donnees[index].nom;
            this.router.navigate(['/exercicedetails'], {
              queryParams: {
                nom: departementNom,
                date: this.date
              }
            });
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                return `Département: ${tooltipItems[0].label}`;
              },
              label: (tooltipItem) => {
                return `Température moyenne: ${tooltipItem.parsed.y.toFixed(1)} degrés`;
              },
              afterLabel: () => {
                return `Relevé le: ${this.date}`;
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
          }
        }
      }
    });
  }
}
