import * as React from 'react'
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonItem,
    IonNote,
    IonGrid, IonRow, IonCol, IonText

} from "@ionic/react";

import {Pool} from '../types/types'
import utils from '../common/utils'
import BigNumber from "bignumber.js";
import i18n from '../i18n';

interface PoolInfoParams {
    pool:Pool
    onView:(p:Pool)=>void
    onStaking:(p:Pool)=>void
}

const PoolInfo:React.FC<PoolInfoParams> = ({pool,onView,onStaking})=>{

    const choiceNum = new BigNumber(pool.choicedNum);
    const missed = new BigNumber(pool.missedNum);
    const wishVoteNum = new BigNumber(pool.wishVoteNum);
    const nodeVoted = choiceNum.minus(missed);
    let missRate = "--";
    if (nodeVoted.comparedTo(0)>0){
        missRate = wishVoteNum.dividedBy(nodeVoted).multipliedBy(100).toFixed(2);
    }
    const state = pool.closed?<IonText color={"danger"}>{i18n.t("state_closed")}</IonText>:<IonText color={"success"}>{i18n.t("state_normal")}</IonText>;

    return (
        <div>
            <IonCard mode="ios">
                <IonCardHeader mode="ios">
                    <IonCardSubtitle mode="ios"><span style={{textTransform:'lowercase'}}>{utils.ellipsis(pool.id)}</span></IonCardSubtitle>
                    <IonCardTitle mode="ios">{utils.convertPoolName(pool.id)}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent mode="ios">
                    <IonGrid >
                        <IonRow>
                            <IonCol>{i18n.t("shares")}<br/><IonNote color={"tertiary"}>{utils.hexToString(pool.shareNum)}</IonNote></IonCol>
                            <IonCol>{i18n.t("fee")}<br/><IonNote color={"tertiary"}>{utils.fromValue(pool.fee,2).toString(10)} %</IonNote></IonCol>
                            <IonCol>{i18n.t("miss")} <br/><IonNote color={"warning"}>{missRate}%</IonNote></IonCol>
                            <IonCol>{i18n.t("state")} <br/><IonNote>{state}</IonNote></IonCol>
                        </IonRow>
                    </IonGrid>
                </IonCardContent>
                <IonItem lines={"none"} mode="ios">
                    <IonButton  mode="ios" fill="outline" slot="end" onClick={()=>onView(pool)}>{i18n.t("view")}</IonButton>
                    {pool.closed?"":<IonButton slot="end" onClick={()=>onStaking(pool)}>{i18n.t("staking")}</IonButton>}
                </IonItem>
            </IonCard>
        </div>
    )
}

export default PoolInfo