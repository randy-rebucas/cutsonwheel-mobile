import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';

import {
  AngularFirestoreCollection,
  AngularFirestore,
  DocumentReference
} from '@angular/fire/firestore';

import { Wallet as useClass } from './wallet';

const collection = 'wallet';
const orderField = 'paymentDate';
const orderBy = 'asc';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(
    private afs: AngularFirestore
  ) { }

  private defaultCollection(): AngularFirestoreCollection<useClass> {
    return this.afs.collection<useClass>(collection, ref => ref.orderBy(orderField, orderBy));
  }

  private filterByUserId(userId: string) {
    return this.afs.collection<useClass>(
      collection,
      ref => ref
      .where('paymentTo', '==', userId)
    );
  }

  private fetchData(col: AngularFirestoreCollection): Observable<any> {
    return col.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  getAll(): Observable<useClass[]> {
    return this.fetchData(this.defaultCollection());
  }

  getOne(id: string): Observable<useClass> {
    return this.defaultCollection().doc<useClass>(id).valueChanges().pipe(
      take(1),
      map(data => {
        data.id = id;
        return data;
      })
    );
  }

  getBySlug(userId: string): Observable<useClass[]> {
    return this.fetchData(this.filterByUserId(userId));
  }

  create(data: any): Promise<DocumentReference> {
    return this.defaultCollection().add(data);
  }

  update(data: any): Promise<void> {
    return this.defaultCollection().doc(data.id).update({
      title: data.title,
      description: data.description
    });
  }

  delete(id: string): Promise<void> {
    return this.defaultCollection().doc(id).delete();
  }
}
