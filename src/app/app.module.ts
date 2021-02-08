import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

/*NgMaterial*/
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon'; 

/*MyComponents*/
import { AppComponent } from './app.component';
import { ScannerComponent } from './scanner/scanner.component';
import { PickingComponent } from './scanner/picking/picking.component';
import { StockComponent } from './scanner/stock/stock.component';
import { CheckstockComponent } from './scanner/stock/checkstock/checkstock.component';
import { SafePipe } from './safe.pipe';
import { AddstockComponent } from './scanner/stock/addstock/addstock.component';

@NgModule({
  declarations: [
    AppComponent,
    ScannerComponent,
    PickingComponent,
    StockComponent,
    CheckstockComponent,
    SafePipe,
    AddstockComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatToolbarModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
