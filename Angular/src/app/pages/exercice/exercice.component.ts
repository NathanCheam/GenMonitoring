import {Component, OnInit} from '@angular/core';
import {ChartService} from '../../services/chart.service';

interface DepartementEx {
  id: number;
  nom: string;
  temperature1?: TemperatureEx;
  temperature2?: TemperatureEx;
  temperature3?: TemperatureEx;
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
  imports: [],
  templateUrl: './exercice.component.html',
  styleUrl: './exercice.component.css'
})
export class ExerciceComponent implements OnInit {
  departement1: DepartementEx = {
    id: 1,
    nom: 'Pas-de-Calais',
    temperature1: {
      id: 1,
      date: new Date('2023-10-01'),
      heure: '12:00',
      valeur: 20,
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
    temperature1: {
      id: 2,
      date: new Date('2023-10-01'),
      heure: '12:00',
      valeur: 20,
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
      valeur: 22,
      idDepartement: 1
    },
    temperature3: {
      id: 13,
      date: new Date('2023-10-03'),
      heure: '12:00',
      valeur: 21,
      idDepartement: 1
    }
  }

  departement4: DepartementEx = {
    id: 4,
    nom: 'Hautes-Alpes',
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
      valeur: 22,
      idDepartement: 1
    },
    temperature3: {
      id: 14,
      date: new Date('2023-10-03'),
      heure: '12:00',
      valeur: 21,
      idDepartement: 1
    }
  }

  departement5: DepartementEx = {
    id: 5,
    nom: 'Vosges',
    temperature1: {
      id: 5,
      date: new Date('2023-10-01'),
      heure: '12:00',
      valeur: 20,
      idDepartement: 1
    },
    temperature2: {
      id: 10,
      date: new Date('2023-10-02'),
      heure: '12:00',
      valeur: 22,
      idDepartement: 1
    },
    temperature3: {
      id: 15,
      date: new Date('2023-10-03'),
      heure: '12:00',
      valeur: 21,
      idDepartement: 1
    }
  }

  lablesList: string[] = ['Car', 'Fruit', 'Chair', 'Table'];
  data: number[] = [5, 2, 10, 3];
  sdata: number[] = [1, 2, 3, 5];
  chartName = 'Data Charts';

  constructor(private chart: ChartService) {
  }

  ngOnInit() {
    this.chart.single(this.chartName, 'Key', this.lablesList, this.data, 'line-chart', 'line');
    this.chart.double(this.chartName, 'Key 1', 'Key 2', this.lablesList, this.data, this.sdata, 'bar-chart', 'bar');
  }
}
