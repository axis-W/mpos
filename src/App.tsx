import React from 'react';
import { Route,Redirect} from 'react-router-dom';
import {
    IonApp,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonBadge,
    IonTabs
} from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { barChartOutline,homeOutline, personOutline,bookmarksOutline} from 'ionicons/icons';

import PoolList from './pages/PoolList';
import Stake from "./pages/Stake";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import service from "./service/service";
import My from "./pages/My";
import i18n from './i18n'
import Home from "./pages/Home";
// @ts-ignore

class App extends React.Component<any, any>{

  componentDidMount(): void {

    service.initApp().then(rest=>{

    }).catch(()=>{

    })
  }

  render(): React.ReactNode {
    return (
      <IonApp>
          <IonReactHashRouter>
              <IonTabs>
                  <IonRouterOutlet animated={true}>
                      {/*<Switch>*/}
                      <Route path="/node/stake/:id" component={Stake} exact={true} />
                      <Route path="/node/list" component={PoolList} exact={true} />
                      <Route path="/my" component={My} exact={true} />
                      <Route path="/summary" component={Home} exact={true} />
                      <Route path="/" render={() => <Redirect to="/summary" />} exact={true} />
                      {/*</Switch>*/}
                  </IonRouterOutlet>
                  <IonTabBar slot="bottom">
                      <IonTabButton tab="summary" href="/summary">
                          <IonIcon icon={barChartOutline} />
                          <IonLabel>{i18n.t("summary")}</IonLabel>
                      </IonTabButton>

                      <IonTabButton tab="node/list" href="/node/list">
                          <IonIcon icon={bookmarksOutline} />
                          <IonLabel>{i18n.t("nodes")}</IonLabel>
                      </IonTabButton>
                      <IonTabButton tab="my" href="/my">
                          <IonIcon icon={personOutline} />
                          <IonLabel>{i18n.t("accounts")}</IonLabel>
                      </IonTabButton>
                  </IonTabBar>
              </IonTabs>
          </IonReactHashRouter>
      </IonApp>
    );
  }
}

export default App;
