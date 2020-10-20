import axios from 'axios'
import BigNumber from "bignumber.js";
// @ts-ignore
import axispp from 'axis-pp'
import i18n from "../i18n";

export interface Tx {
    from:string
    mainPKr:string
    value:BigNumber
    poolId?:string
}
class Service {

    id: number

    constructor() {
        this.id = 0;
    }

    async jsonRpc(method: string, args: any,rpcHost?:string) {
        const data: any = {
            id: this.id++,
            method: method,
            params: args
        }
        let host = localStorage.getItem("rpcHost");
        if(rpcHost){
            host = rpcHost;
        }
        console.log('host',host);
        return new Promise((resolve, reject) => {
            if(!host){
                reject(new Error("rpc host required!"))
            }else{
                axios.post(host, data).then((resp: any) => {
                    if(resp.data && resp.data.error){
                        reject(new Error(resp.data.error.message))
                    }else if(resp.data && resp.data.result){
                        resolve(resp.data.result)
                    }
                }).catch(e => {
                    reject(e)
                })
            }
        })
    }

    async get(url: string) {
        return new Promise((resolve, reject) => {
            axios.get(url).then((resp: any) => {
                resolve(resp.data)
            }).catch(e => {
                reject(e)
            })
        })
    }

    async commitTx(tx:Tx){
        await this.initApp()
        alert(JSON.stringify(tx));
        return new Promise<any>((resolve, reject) => {
            resolve(tx.from)
            resolve(tx.mainPKr)
            let executeData = {
                from: tx.from,
                value: "0x" + tx.value.toString(16),
                gasPrice: '0x' + new BigNumber('1000000000').toString(16),
                cy: "AXIS",
                gas:'0x' + new BigNumber('25000').toString(16),
                BuyShare: {
                    Vote: tx.mainPKr,
                    Value: '0x' + tx.value.toString(16),
                    Pool: tx.poolId
                }
            }
            axispp.executeContract(executeData, function (rest:any,err:any) {
                alert('1111');
                if(err){
                    alert(JSON.stringify(err));
                    //reject(err)
                }else{
                    alert(JSON.stringify(rest));
                    //resolve(rest)
                }
            })
        })
    }

    async initApp(){
        return new Promise(resolve=>{
            const dapp = {
                name: "MPoS",
                contractAddress: "sero-mpos",
                github: "https://github.com/uhexio/sero-mpos",
                author: "uhexio",
                url: window.location.href,
                logo: window.location.origin+window.location.pathname +"assets/icon/icon.png",
            }

            axispp.init(dapp,function (rest:any) {
                axispp.getInfo(function (data:any) {
                    if(data){
                        localStorage.setItem("language",data.language);
                        localStorage.setItem("rpcHost",data.rpc)
                        i18n.changeLanguage(data.language).then(() => {
                            // document.location.href = 'http://' + document.location.host;
                        });
                    }
                    resolve()
                })
            })
        })
    }

    async getAccounts(){
        await this.initApp()
        return new Promise((resolve,reject) => {
            axispp.getAccountList((data:any,err:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data)
                }
            })
        })
    }

    async getAccount(pk:string){
        await this.initApp()

        return new Promise((resolve,reject) => {
            axispp.getAccountDetail(pk,(data:any,err:any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data)
                }
            })
        })
    }

}

const service:Service = new Service()
export default service