import { Component } from '@angular/core';

import { FeedsPage } from '../feeds/feeds';
import { PlannerPage } from '../planner/planner';
import { HomePage } from '../home/home';
import { ChatsPage } from '../chats/chats';
import { ProfilePage } from '../profile/profile';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = PlannerPage;
  tab3Root = FeedsPage;
  tab4Root = ChatsPage;
  tab5Root = ProfilePage;
  constructor() {

  }
}
