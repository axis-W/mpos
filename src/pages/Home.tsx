import * as React from 'react';

import {
    IonPage,
    IonContent,
    IonRow,
    IonCol,
    IonText,
    IonList,
    IonItem,
    IonGrid,
    IonItemDivider,
    IonLabel,
    IonBadge,
    IonLoading
} from '@ionic/react'
import './Home.css'
import i18n from "../i18n";
import service from "../service/service";
import BigNumber from "bignumber.js";
import utils from "../common/utils";

interface State {
    blockHeight:number
    avgTime:any
    sharesOfBlock:number
    latestPrice:any
    profitPerShare:any
    profitPerM:any
    totalShares:any
    nodeNumber:any
    posReward:any

    choicePercent:any
    totalProfit:any

    showLoading:boolean

}


class Home extends React.Component<State, any>{

    state:State = {
        blockHeight:0,
        avgTime:'15s',
        sharesOfBlock:3,
        latestPrice:'0 AXIS',
        profitPerShare:'0 AXIS',
        profitPerM:'0 AXIS/天',
        totalShares:'0',
        nodeNumber:'0',
        posReward:'0',

        choicePercent:'0',
        totalProfit:'0',
        showLoading:false

    }

    componentDidMount(): void {

        this.setShowLoading(true);
        this.getData().catch()
    }

    componentWillReceiveProps(nextProps: Readonly<State>, nextContext: any): void {
        this.setShowLoading(true);
        this.getData().catch()
    }

    async getData(){
        console.log('service',service); 
        const blockHeight:any = await service.jsonRpc("axis_blockNumber",["latest"]);
        const blockHeightA:any = await service.jsonRpc("axis_getBlockByNumber",[blockHeight,false]);

        const blockHeightB:any = await service.jsonRpc("axis_getBlockByNumber",["0x"+new BigNumber(blockHeight).minus(new BigNumber(501)).toString(16),false]);
        const powReward:any = await service.jsonRpc("axis_getBlockRewardByNumber",[blockHeight]);
        const totalReword:any = await service.jsonRpc("axis_getBlockTotalRewardByNumber",[blockHeight]);

        const stakePools:any = await service.jsonRpc("stake_stakePools",[]);
        const sharePrice:any = await service.jsonRpc("stake_sharePrice",[]);
        const sharePoolSize:any = await service.jsonRpc("stake_sharePoolSize",[]);

        let totalProfit = new BigNumber(0) ;
        let totalMiss=new BigNumber(0) ;
        let totalExpire=new BigNumber(0) ;
        let totalChoice = new BigNumber(0) ;
        let closeNum = 0 ;
        let totalCurrentShares = new BigNumber(0) ;
        for(let i=0;i<stakePools.length;i++){
            const pool = stakePools[i];
            totalCurrentShares = totalCurrentShares.plus(new BigNumber(pool.shareNum))
            totalProfit = totalProfit.plus(new BigNumber(pool.profit))
            totalMiss = totalMiss.plus(new BigNumber(pool.missedNum))
            totalExpire = totalExpire.plus(new BigNumber(pool.expireNum))
            totalChoice = totalChoice.plus(new BigNumber(pool.choicedNum))
            if(pool.closed){
                closeNum++
            }
        }
        let totalShares = totalCurrentShares.plus(totalMiss).plus(totalExpire).plus(totalChoice);
        const BT:any = (blockHeightA.timestamp - blockHeightB.timestamp)/500;
        const perShareReward = utils.fromValue(new BigNumber(totalReword).minus(new BigNumber(powReward[0])).div(3),18);
        const dayChoice = totalChoice.multipliedBy(
            new BigNumber(utils.toValue(1e4,18).div(sharePrice).toFixed(0,1))
        ).div(totalShares);


        // 1e4 reward per day
        const ps = dayChoice.multipliedBy(perShareReward);

        this.setState({
            showLoading:false,
            blockHeight:new BigNumber(blockHeight).toNumber(),
            avgTime:new BigNumber(BT).toFixed(4) + " s",
            sharesOfBlock:3,
            latestPrice:utils.fromValue(sharePrice,18).toFixed(6,1) + " AXIS",
            profitPerShare:perShareReward.toFixed(6,1),
            profitPerM:ps.toString(10) +' AXIS/天',
            totalShares:new BigNumber(sharePoolSize).toString(10),
            nodeNumber:stakePools.length-closeNum + '/' + stakePools.length,
            posReward:utils.fromValue(new BigNumber(totalReword).minus(new BigNumber(powReward[0])),18).toFixed(6,1),

            choicePercent:totalChoice.div(totalShares).multipliedBy(100).toFixed(2,1) + "%",
            totalProfit:utils.fromValue(totalProfit,18).toFixed(6,1) + " AXIS"
        })

    }

    setShowLoading = (f: boolean) => {
        this.setState({
            showLoading: f
        })
    }

    render(): React.ReactNode {

        const {blockHeight,avgTime,sharesOfBlock,latestPrice,profitPerShare,profitPerM,posReward,totalShares,nodeNumber,choicePercent,totalProfit,showLoading} = this.state;
        return <>
            <IonPage>
                <IonContent >
                    <IonList>
                        <IonItemDivider mode="ios">{i18n.t("descTitle")}</IonItemDivider>
                        <IonItem className="content" lines="none">
                            {i18n.t("description")}
                        </IonItem>



                        <IonItemDivider mode="ios">{i18n.t("summary")}</IonItemDivider>
                        <IonItem className="text-head" >
                            <IonLabel>{i18n.t("blockHeigt")}</IonLabel>
                            <IonBadge>{blockHeight}</IonBadge>
                        </IonItem>
                        <IonItem className="text-head" >
                            <IonLabel>{i18n.t("avgTime")}</IonLabel>
                            <IonBadge color="secondary">{avgTime}</IonBadge>
                        </IonItem>
                        <IonItem className="text-head" >
                            <IonLabel>{i18n.t("latestPrice")}</IonLabel>
                            <IonBadge color="tertiary">{latestPrice}</IonBadge>
                        </IonItem>
                        <IonItem className="text-head" >
                            <IonLabel>{i18n.t("posRewardOfBlock")}</IonLabel>
                            <IonBadge color="success">{posReward} AXIS</IonBadge>
                        </IonItem>
                        <IonItem className="text-head" >
                            <IonLabel>{i18n.t("numberOfPos")}</IonLabel>
                            <IonBadge color="warning">{sharesOfBlock}</IonBadge>
                        </IonItem>
                        <IonItem className="text-head" >
                            <IonLabel>{i18n.t("rewardOfPerShare")}</IonLabel>
                            <IonBadge color="danger">{profitPerShare} AXIS</IonBadge>
                        </IonItem>
                        {/*<IonItem className="text-head" >*/}
                        {/*    <IonLabel>当前万币收益</IonLabel>*/}
                        {/*    <IonBadge>{profitPerM}</IonBadge>*/}
                        {/*</IonItem>*/}
                        <IonItem className="text-head" >
                            <IonLabel>{i18n.t("totalShares")}</IonLabel>
                            <IonBadge color="light">{totalShares}</IonBadge>
                        </IonItem>
                        {/*<IonItem className="text-head" >*/}
                        {/*    <IonLabel>总投票百分比</IonLabel>*/}
                        {/*    <IonBadge color="light">{choicePercent}</IonBadge>*/}
                        {/*</IonItem>*/}
                        {/*<IonItem className="text-head" >*/}
                        {/*    <IonLabel>PoS总奖励</IonLabel>*/}
                        {/*    <IonBadge color="light">{totalProfit}</IonBadge>*/}
                        {/*</IonItem>*/}

                        <IonItem className="text-head" >
                            <IonLabel>{i18n.t("totalNodeNum")}</IonLabel>
                            <IonBadge color="dark">{nodeNumber}</IonBadge>
                        </IonItem>

                    </IonList>

                    <IonLoading
                        cssClass='my-custom-class'
                        isOpen={showLoading}
                        onDidDismiss={() => this.setShowLoading(false)}
                        message={i18n.t("loading")}
                    />
                </IonContent>
            </IonPage>
        </>
    }
}


export default Home