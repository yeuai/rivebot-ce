import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private logger: NGXLogger,
    private translate: TranslateService
    ) {
      // chuyển đổi ngôn ngữ, cấu hình trong thư mục assets/i188n
      // default: en.json
      this.translate.setDefaultLang('en');

      this.logger.debug('App config: ', environment);
  }
}
