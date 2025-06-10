import {DataSource} from "@angular/cdk/collections";
import {Departement} from "./departement";
import {BehaviorSubject, Observable} from "rxjs";
import {DepartementsTemperaturesService} from "../../services/departementsTemperatures.service";

export class DataSourceAsyncro extends DataSource<Departement> {
    private departementsSubject = new BehaviorSubject<Departement[]>([]);

    constructor(private departementsService: DepartementsTemperaturesService) {
        super();
    }



    connect(): Observable<Departement[]> {
        return this.departementsSubject.asObservable();
    }

    disconnect() {
        this.departementsSubject.complete();
    }

    setData(sortDepartement = 0, sortDatetime = 2, colonneTriee: 'departement' | 'datetime' = 'departement') {
        this.departementsService.getDepartements()
            .subscribe(response => {
                let result = [...response.metriques];

                if(colonneTriee === 'departement') {
                    if (sortDepartement === 0) {
                        // Tri par nom de département (ordre croissant)
                        result = result.sort((a, b) => a.metrique.localeCompare(b.metrique));
                    } else if (sortDepartement === 1) {
                        // Tri par nom de département (ordre décroissant)
                        result = result.sort((a, b) => b.metrique.localeCompare(a.metrique));
                    }
                } else {
                    if (sortDatetime === 2) {
                        // Tri par date (ordre croissant)
                        result = result.sort((a, b) => a.datetime.localeCompare(b.datetime));
                    } else if (sortDatetime === 3) {
                        // Tri par date (ordre décroissant)
                        result = result.sort((a, b) => b.datetime.localeCompare(a.datetime));
                    }
                }

                this.departementsSubject.next(result);
            });
    }

    updateData(data: any[]) {
        this.departementsSubject.next(data);
    }
}
