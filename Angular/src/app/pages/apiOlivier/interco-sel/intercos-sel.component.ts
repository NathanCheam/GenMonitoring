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
    'nom_asc': 0, // Ordre ascendant (A-Z)
    'nom_desc': 1, // Ordre descendant (Z-A)
  }

  // État de tri actuel, initialisé avec la valeur par défaut
  sortState: SortStateKey = 'nom_asc';

  // Méthode pour basculer entre les différents états de tri
  trierNom() {
    if (this.sortState === 'nom_asc') { // Si l'état actuel est ascendant, on le change en descendant
      this.sortState = 'nom_desc';
    } else { // Sinon, on le remet à l'état ascendant
      this.sortState = 'nom_asc';
    }

    // Application de l'état de tri à la source de données
    if (this.dataSource) {
      // Met à jour les données de la source en fonction de l'état de tri actuel
      this.dataSource.setDataNoms(this.sortStateMatching[this.sortState]);
    }
  }

  router = inject(Router);


  ngOnInit() {
    // Initialisation de la source de données
    this.dataSource = new DataSourceAsyncro(this.IntercosService);

    // Configuration initiale avec le tri par défaut
    this.dataSource.setDataNoms(this.sortStateMatching[this.sortState]);

    // Surveillance des changements d'URL pour mettre à jour les données
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
    // Génère une clé unique pour cette interconnexion dans le localStorage
    const storageKey = `interco_status_${encodeURIComponent(url)}`;
    // Récupère les données mises en cache pour cette clé
    const cachedData = localStorage.getItem(storageKey);
    // Vérifie si des données existent dans le cache
    if (cachedData) {
      try {
        // Convertit la chaîne JSON en objet JavaScript
        const parsedData = JSON.parse(cachedData);
        // Vérifie que l'objet contient des données de métriques
        if (parsedData && parsedData.metriquesDonnees && parsedData.metriquesDonnees.length > 0) {
          // Crée une copie triée des données (du plus récent au plus ancien)
          const sortedData = [...parsedData.metriquesDonnees].sort((a, b) =>
              new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
          );
          // Retourne le statut le plus récent sous forme textuelle
          return sortedData[0].status === true ? 'Disponible' : 'Indisponible';
        }
      } catch (e) {
        console.error('Erreur lors de la lecture du cache pour', url, e);
      }
    }
    // Retourne null si aucune donnée n'est trouvée ou en cas d'erreur
    return null;
  }

  searchTerm: string = '';
  IntercosComplets: any[] = [];

  filtrerIntercos() {
    // Vérifie si la source de données existe, sinon quitte la fonction
    if (!this.dataSource) return;

    // Vérifie si la liste complète des interconnexions a déjà été chargée
    if (this.IntercosComplets.length === 0) {
      // Si la liste est vide, récupère toutes les interconnexions depuis la source
      this.dataSource.connect().subscribe(Intercos => {
        // Crée une copie complète des données récupérées
        this.IntercosComplets = [...Intercos];
        // Applique le filtre de recherche sur ces données
        this.appliquerFiltre();
      });
    } else {
      // Vérifie si le terme de recherche est vide
      if (!this.searchTerm.trim()) {
        // Si aucun terme de recherche, affiche toutes les interconnexions
        this.dataSource.updateData(this.IntercosComplets);
      } else {
        // Si un terme de recherche existe, applique le filtre correspondant
        this.appliquerFiltre();
      }
    }
  }
// Ajouter cette propriété à votre classe
  private estEnCoursDeRechargement = false;

  private appliquerFiltre() {
    // Éviter les appels multiples simultanés
    if (this.estEnCoursDeRechargement) return;

    // Activer le drapeau de verrouillage
    this.estEnCoursDeRechargement = true;

    try {
      // Logique de filtrage
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
      // Garantir que le drapeau est réinitialisé après un délai
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

  /**
   * Récupère les données d'une interconnexion et les stocke avant navigation
   * @param url URL de l'interconnexion à consulter
   * @param nom Nom de l'interconnexion pour l'affichage
   */
  obtenir_donnees(url: string, nom: string) {
    // Vérifie que la source de données est initialisée
    if (this.dataSource) {
      // Appelle le service pour récupérer le statut de l'interconnexion spécifiée
      this.IntercosService.getIntercoStatus(url).subscribe({
        // En cas de succès de la requête API
        next: (response) => {
          if (response && response.metriquesDonnees) {
            // Persiste les données de métriques dans le stockage local sous format JSON
            localStorage.setItem('donnees_sauvegardees', JSON.stringify(response.metriquesDonnees));
            // Sauvegarde le nom du service pour l'affichage dans la vue détaillée
            localStorage.setItem('nom_service', nom);
            // Conserve l'URL source pour d'éventuelles requêtes supplémentaires
            localStorage.setItem('url_interco', url);

            this.router.navigate(['/donnees']).then();
          }
        },
        // En cas d'échec de la requête API
        error: (err) => {
          console.error('Erreur lors de la récupération des données:', err);
        }
      });
    }
  }


}
