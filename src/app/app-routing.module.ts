import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MsmeComponent } from './pages/msme/msme.component';

const routes: Routes = [
  {path:"register/vendor",
  component:MsmeComponent
  },
  {path:"**",
  redirectTo:"register/vendor"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ preloadingStrategy: PreloadAllModules, useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
