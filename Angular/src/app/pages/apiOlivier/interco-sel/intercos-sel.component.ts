import {Component, inject, OnInit} from '@angular/core';
import {IntercosService} from '../../../services/intercos.service';
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
import {DataSourceAsyncro} from '../../../models/intercos/data-source-asyncro';
import {DatePipe} from '@angular/common';
import {Chart, ChartType} from "chart.js";
import {FormsModule} from "@angular/forms";

type SortStateKey = 'nom_asc' | 'nom_desc';

@Component({
  selector: 'app-Intercos-sel',
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
    MatIcon
  ],
  templateUrl: './intercos-sel.component.html',
  styleUrl: './intercos-sel.component.css',
  providers: [DatePipe]
})
export class IntercosSelComponent implements OnInit {
  IntercosService = inject(IntercosService);
  route = inject(ActivatedRoute);
  displayedColumns: string[] = ['nom', 'statut_recent'];
  dataSource?: DataSourceAsyncro;

  private sortStateMatching = {
    'nom_asc': 0,
    'nom_desc': 1,
  }

  sortState: SortStateKey = 'nom_asc';
  constructor() {}

  trierNom() {
    if (this.sortState === 'nom_asc') {
      this.sortState = 'nom_desc';
    } else {
      this.sortState = 'nom_asc';
    }

    if (this.dataSource) {
      this.dataSource.setDataNoms(this.sortStateMatching[this.sortState]);
    }
  }

  router = inject(Router);


  ngOnInit() {
    this.dataSource = new DataSourceAsyncro(this.IntercosService);

    this.dataSource.setDataNoms(this.sortStateMatching[this.sortState]);

    this.route.queryParamMap.subscribe(() => {
      if (this.dataSource) {
        this.dataSource.setDataNoms(this.sortStateMatching[this.sortState]);
      }
    });
  }

  /**
   * Récupère le statut le plus récent du localStorage pour un interco donné
   */
  getStatusFromLocalStorage(url: string): string | null {
    const storageKey = `interco_status_${encodeURIComponent(url)}`;
    const cachedData = localStorage.getItem(storageKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (parsedData && parsedData.metriquesDonnees && parsedData.metriquesDonnees.length > 0) {
          // Trier par date pour avoir le plus récent
          const sortedData = [...parsedData.metriquesDonnees].sort((a, b) =>
            new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
          );

          if (sortedData.length > 0) {
            // Convertir la valeur booléenne en chaîne
            return sortedData[0].status === true ? 'Disponible' : 'Indisponible';
          }
        }
      } catch (e) {
        console.error('Erreur lors de la lecture du cache pour', url, e);
      }
    }

    return null;
  }

  searchTerm: string = '';
  IntercosComplets: any[] = [];

  filtrerIntercos() {
    if (!this.dataSource) return;

    // Toujours s'assurer que nous avons la liste complète
    if (this.IntercosComplets.length === 0) {
      this.dataSource.connect().subscribe(Intercos => {
        this.IntercosComplets = [...Intercos];
        this.appliquerFiltre();
      });
    } else {
      // Si la recherche est vide, réinitialiser l'affichage avec tous les départements
      if (!this.searchTerm.trim()) {
        this.dataSource.updateData(this.IntercosComplets);
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
        if (this.IntercosComplets.length > 0) {
          Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
          });

          // Recharger les données
          if (this.dataSource) {
            this.dataSource.setDataNoms(
                this.sortStateMatching[this.sortState],
            );

            /*// Rafraîchir les graphiques si on est sur l'onglet graphiques
            if (this.ongletActif === 'graphiques') {
              setTimeout(() => this.generer_grapheO(), 100);
            }*/
          }
        } else {
          // Charger la liste complète une seule fois
          this.dataSource!.connect().subscribe(Intercos => {
            this.IntercosComplets = [...Intercos];
            this.dataSource!.updateData(this.IntercosComplets);
          });
        }
      } else {
        // Filtrer les départements selon le terme de recherche
        const termeRecherche = this.searchTerm.toLowerCase().trim();
        const resultatsFiltres = this.IntercosComplets.filter(dept =>
            dept.metrique.toLowerCase().includes(termeRecherche)
        );
        this.dataSource!.updateData(resultatsFiltres);
      }

      /*if (this.ongletActif === 'graphiques') {
        this.generer_grapheO();
      }*/
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

  obtenir_donnees(url: string, nom: string) {
    if (this.dataSource) {
      // Récupérer les données avant de naviguer
      this.IntercosService.getIntercoStatus(url).subscribe({
        next: (response) => {
          if (response && response.metriquesDonnees) {
            // Stocker les données dans localStorage
            localStorage.setItem('donnees_sauvegardees', JSON.stringify(response.metriquesDonnees));
            localStorage.setItem('nom_service', nom);
            localStorage.setItem('url_interco', url);

            // Naviguer vers la page
            this.router.navigate(['/donnees']).then();
          }
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des données:', err);
        }
      });
    }
  }


}
