import * as React from 'react';
import {
    IonContent,
    IonPage,
    IonToolbar,
    IonLoading,
    IonToast,
    IonModal,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonNote,
    IonRow,
    IonCol,
    IonSearchbar,
    IonFab,
    IonFabButton,IonIcon

} from '@ionic/react';
import service from "../service/service";
import {Pool} from "../types/types";
import PoolInfo from "../components/PoolInfo";
import utils from "../common/utils";
import BigNumber from 'bignumber.js'
import i18n from '../i18n'

interface State {
    poolList: Array<Pool>
    poolListOrg: Array<Pool>
    showLoading: boolean
    showToast: boolean
    toastMsg: string
    showModal: boolean
    selectPool: any
    isDark?:boolean
    searchText:string
}

class PoolList extends React.Component<any, State> {

    state: State = {
        poolList: [],
        poolListOrg:[],
        showLoading: true,
        showToast: false,
        toastMsg: '',
        showModal: false,
        selectPool: null,
        searchText:''
    }

    componentDidMount(): void {

        const that = this;
        service.initApp().then(rest=>{
            that.getPoolList();
        }).catch(()=>{

        })
        const tdard:any = localStorage.getItem("themeDark");
        let isDark = false;
        if(tdard === true || tdard === "true"){
            isDark = true;
        }
        document.body.classList.toggle('dark', isDark);
        this.setState({
            isDark:isDark
        })

    }


    getPoolList() {
        const that = this;
        service.jsonRpc("stake_stakePools", []).then((rest: any) => {
            that.setState({
                poolList: rest,
                poolListOrg:rest
            })
            that.setShowLoading(false);
        }).catch((e) => {
            that.toast(e.message)
            that.setShowLoading(false);
        })
    }

    renderList = (list: Array<Pool>) => {
        let pools: Array<any> = new Array<any>();
        list.forEach((value => {
            pools.push(<PoolInfo pool={value} onView={this.onView} onStaking={this.onStaking}/>)
        }))
        return pools
    }

    onView = (p: Pool) => {
        this.setState({
            selectPool:p,
            showModal:true
        })
    }

    onStaking = (p: Pool) => {
        window.location.href = `#/node/stake/${p.id}`
    }

    setShowLoading = (f: boolean) => {
        this.setState({
            showLoading: f
        })
    }

    setShowToast = (f: boolean) => {
        this.setState({
            showToast: f
        })
    }

    toast = (msg: string) => {
        this.setState({
            showToast: true,
            toastMsg: msg
        })
    }

    setShowModal = (f: boolean) => {
        this.setState({
            showModal: f
        })
    }

    renderInfo = (data:Pool)=>{
        if(!data){
            return null
        }
        const choiceNum = new BigNumber(data.choicedNum);
        const missed = new BigNumber(data.missedNum);
        const wishVoteNum = new BigNumber(data.wishVoteNum);
        const nodeVoted = choiceNum.minus(missed);

        const soloVoted = missed.minus(wishVoteNum);
        let missRate = "--";
        if (nodeVoted.comparedTo(0)>0){
            missRate = wishVoteNum.dividedBy(nodeVoted).multipliedBy(100).toFixed(2);
        }

        const state = data.closed?<IonText color={"danger"}>{i18n.t("state_closed")}</IonText>:<IonText color={"success"}>{i18n.t("state_normal")}</IonText>;
        return <div>
            <IonList>
                 <IonItem mode="ios">
                    <IonLabel className="ion-text-wrap">
                        <IonText color={"secondary"} style={{fontWeight:'600'}}>{utils.convertPoolName(data.id)}</IonText>
                        <p></p>
                        <IonText color={"dark"}>{data.id}</IonText>
                    </IonLabel>
                </IonItem>
                 <IonItem mode="ios">
                    <IonLabel mode="ios">{i18n.t("state")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"primary"}>{state}</IonNote>
                </IonItem>
                 <IonItem mode="ios">
                    <IonLabel mode="ios">{i18n.t("node_voted")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"tertiary"}>{utils.hexToString(choiceNum)}</IonNote>
                </IonItem>
                 <IonItem mode="ios">
                    <IonLabel mode="ios">{i18n.t("solo_voted")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"tertiary"}>{utils.hexToString(soloVoted)}</IonNote>
                </IonItem>
                 <IonItem mode="ios">
                    <IonLabel mode="ios">{i18n.t("miss")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"warning"}>{missed.toString(10)}</IonNote>
                </IonItem>
                 <IonItem mode="ios">
                    <IonLabel mode="ios">{i18n.t("missRate")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"danger"}>{missRate}%</IonNote>
                </IonItem>
                 <IonItem mode="ios">
                    <IonLabel mode="ios">{i18n.t("fee")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"tertiary"}>{utils.fromValue(data.fee,2).toString(10)}%</IonNote>
                </IonItem>
                 <IonItem mode="ios">
                    <IonLabel mode="ios">{i18n.t("shares")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"tertiary"}>{utils.hexToString(data.shareNum)}</IonNote>
                </IonItem>
                 <IonItem mode="ios">
                    <IonLabel mode="ios">{i18n.t("profit")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"tertiary"}>{utils.fromValue(data.profit,18).toFixed(2)} AXIS</IonNote>
                </IonItem>
                 <IonItem mode="ios">
                    <IonLabel mode="ios">{i18n.t("latestPayBlock")}</IonLabel>
                    <IonNote mode="ios" slot={"end"} color={"tertiary"}>{utils.hexToString(data.lastPayTime)}</IonNote>
                </IonItem>
            </IonList>
        </div>
    }

    changeTheme=(v:any)=>{

        localStorage.setItem("themeDark",v.detail.checked)

        document.body.classList.toggle('dark', v.detail.checked);
    }

    search =(v:any)=>{
        const {poolListOrg} = this.state;
        let list:Array<Pool> = [];
        if(v){
            const vl=v.toLowerCase();

            for(let pool of poolListOrg){
                const name = utils.convertPoolName(pool.id);
                if(pool.id.indexOf(vl)>-1 || (name&&name.toLowerCase().indexOf(vl)>-1)){
                    list.push(pool)
                }
            }
        }else{
            list = poolListOrg
        }
        this.setState({
            searchText:v,
            poolList:list
        })
    }

    render(): React.ReactNode {
        const {poolList, showLoading, showToast, toastMsg, showModal,selectPool,isDark,searchText} = this.state;
        const pools = this.renderList(poolList);
        const poolInfo = this.renderInfo(selectPool);
        return (
            <IonPage>
                <IonToolbar>
                    <IonSearchbar value={searchText} onIonChange={e => this.search(e.detail.value!)}/>
                </IonToolbar>

                {/*<IonHeader>*/}
                {/*    <IonToolbar>*/}
                {/*        <IonTitle>Staking Node List</IonTitle>*/}
                {/*    </IonToolbar>*/}
                {/*</IonHeader>*/}
                <IonContent>
                    {/*<IonList>*/}
                    {/*    <IonItem lines="full">*/}
                    {/*        <IonIcon slot="start" icon={moon}/>*/}
                    {/*        <IonLabel mode="ios">*/}
                    {/*            Toggle Dark*/}
                    {/*        </IonLabel>*/}
                    {/*        <IonToggle id="themeToggle" slot="end" checked={isDark} onIonChange={(v)=>{this.changeTheme(v)}}/>*/}
                    {/*    </IonItem>*/}
                    {/*</IonList>*/}

                    {pools}
                    <IonLoading
                        cssClass='my-custom-class'
                        isOpen={showLoading}
                        onDidDismiss={() => this.setShowLoading(false)}
                        message={i18n.t("loading")}
                    />
                    <IonToast
                        isOpen={showToast}
                        onDidDismiss={() => this.setShowToast(false)}
                        message={toastMsg}
                        duration={200}
                    />
                    <IonModal isOpen={showModal} cssClass='my-custom-class'>
                        {poolInfo}
                        <IonRow>
                            <IonCol size="3">
                                <IonButton onClick={() => this.setShowModal(false)} expand={"block"} fill={"outline"}>{i18n.t("close")}</IonButton>
                            </IonCol>
                            <IonCol>
                                <IonButton onClick={() => this.onStaking(selectPool)} expand={"block"} >{i18n.t("staking")}</IonButton>
                            </IonCol>
                        </IonRow>

                    </IonModal>
                </IonContent>
            </IonPage>

        )
    }
}

export default PoolList;
