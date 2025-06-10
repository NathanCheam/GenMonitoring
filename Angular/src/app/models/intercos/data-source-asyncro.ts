import {DataSource} from "@angular/cdk/collections";
import {Interco} from "./interco";
import {IntercoStatus} from "./intercoStatus";
import {BehaviorSubject, Observable} from "rxjs";
import {IntercosService} from "../../services/intercos.service";

export class DataSourceAsyncro extends DataSource<Interco | IntercoStatus> {
    private IntercosSubject = new BehaviorSubject<(Interco | IntercoStatus)[]>([]);

    constructor(private IntercosService: IntercosService) {
        super();
    }

    connect(): Observable<(Interco | IntercoStatus)[]> {
        return this.IntercosSubject.asObservable();
    }

    disconnect() {
        this.IntercosSubject.complete();
    }

    setDataNoms(sortNom = 0) {
        this.IntercosService.getIntercos()
            .subscribe(response => {
                let result = [...response.metriques];
                if (sortNom === 0) {
                    // Tri par date (ordre croissant)
                    result = result.sort((a, b) => a.nom.localeCompare(b.nom));
                } else {
                    // Tri par date (ordre décroissant)
                    result = result.sort((a, b) => b.nom.localeCompare(a.nom));
                }
                this.IntercosSubject.next(result);
            });
    }

    setDataDonnees(sortDatetime = 0, url: string) {
        this.IntercosService.getIntercoStatus(url)
            .subscribe({
                next: (response) => {
                    console.log('Réponse brute du service:', response);
                    if (response && response.metriquesDonnees && Array.isArray(response.metriquesDonnees)) {
                        let result = [...response.metriquesDonnees];
                        if (sortDatetime === 0) {
                            result = result.sort((a, b) => a.datetime.localeCompare(b.datetime));
                        } else {
                            result = result.sort((a, b) => b.datetime.localeCompare(a.datetime));
                        }
                        console.log('Données traitées:', result);
                        this.IntercosSubject.next(result);
                    } else {
                        console.error('Format de données inattendu:', response);
                        this.IntercosSubject.next([]);
                    }
                },
                error: (err) => {
                    console.error('Erreur lors de la récupération des données:', err);
                    this.IntercosSubject.next([]);
                }
            });
    }

    updateData(data: any[]) {
        this.IntercosSubject.next(data);
    }
}
