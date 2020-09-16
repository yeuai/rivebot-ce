import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AutosizeModule } from 'ngx-autosize';
import { BsDropdownModule } from 'ngx-bootstrap';
import { ContextMenuModule } from 'ngx-contextmenu';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { ToastrModule } from 'ngx-toastr';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './confirmation-dialog/confirmation-dialog.service';
import { AutofocusDirective } from './directives/auto-focus.directive';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { CopyrightDirective } from './directives/copyright.directive';
import { UpperCaseDirective } from './directives/upppercase.directive';
import { AuthGuard } from './guards/auth.guard';
import { DominatePipe } from './pipes/dominate/dominate.pipe';
import { SafeHtmlPipe } from './pipes/safe-html/safe-html.pipe';
import { SearchPipe } from './pipes/search/search.pipe';
@NgModule({
  declarations: [
    ClickStopPropagationDirective,
    UpperCaseDirective,
    CopyrightDirective,
    SearchPipe,
    DominatePipe,
    SafeHtmlPipe,
    ConfirmationDialogComponent,
    AutofocusDirective
  ],
  providers: [
    AuthGuard,
    ConfirmationDialogService
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot(),
    NgxWebstorageModule.forRoot(),
    NgSelectModule,
    FilterPipeModule,
    ContextMenuModule.forRoot({
      useBootstrap4: false
    }),
    AutosizeModule
  ],
  /**
   * Export các directives, pipes, ... dùng chung
   * Chú ý: Phải khai báo declarations hoặc imports trước!
   */
  exports: [
    CommonModule,
    FormsModule,
    ClickStopPropagationDirective,
    UpperCaseDirective,
    CopyrightDirective,
    SearchPipe,
    DominatePipe,
    SafeHtmlPipe,
    FilterPipeModule,
    NgbModule,
    BsDropdownModule,
    NgSelectModule,
    ContextMenuModule,
    AutosizeModule
  ],
  entryComponents: [
    ConfirmationDialogComponent
  ]
})
export class  SharedModule { }
