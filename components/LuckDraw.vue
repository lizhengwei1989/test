<template>
  <article v-if="visible" class="root">
    <div class="mask">
      <div class="content">
        <i class="el-icon-close" @click="close" style="color:grey"></i>
        <!-- 标题 -->
        <el-row>
          <h1 class="title">{{$t('LuckyDraw.title')}}</h1>
        </el-row>
        <!-- 玩法说明 -->
        <!-- <el-row>
          <span class="introduct">{{$t('LuckyDraw.introductions')}}</span>
        </el-row> -->
        <!-- 列表 -->
        <el-row>
          <table cellspacing="0" cellpadding="0" class="list">
            <thead>
              <tr>
                <td>{{$t('LuckyDraw.number')}}</td>
                <td>{{$t('LuckyDraw.reward')}}</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in rewardList" :key="index">
                <td>{{item.number}}</td>
                <td>{{item.reward}}</td>
              </tr>
            </tbody>
          </table>
        </el-row>
        <el-row class="record">
            <el-col :span="3">
                <img :src="require('../assets/images/user-1.png')" class="user-img">
            </el-col>
            <el-col :span="16" class="prize">
                <div>{{$t('LuckyDraw.rewardText')}} <span>{{balance + ' TRX'}}</span></div>
                
            </el-col>
            <el-col class="btn-withdraw" :span="5">
                <button class="with-draw" @click="withdraw" v-loading="isLoading"
            element-loading-text="loading..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.6)">
                  {{$t('LuckyDraw.withdraw')}}
                </button>
            </el-col>
        </el-row>
        <!-- 抽奖 -->
        <el-row class="lottery">
          <!-- 开奖结果 -->
          <!-- <el-col :span="8">
            <div class="t1">
              
            </div>
          </el-col> -->
          <!-- 抽奖触发 -->
          <el-col :span="24" style="text-align: center;margin-bottom:0.1rem;position:relative">
              <div class="lucky-num" v-show="luckyNumShow">
                  {{$t('LuckyDraw.winText') + ' ' + luckyNum}}
              </div>
              <button @click="getLuckyNum" class="roll">
                {{times+' '+ $t('LuckyDraw.times')}}
              </button> 
          </el-col>
          <!-- 奖金 -->
          <!-- <el-col
            :span="8"
            v-loading="isLoading"
            element-loading-text="loading..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.6)"
          >
            <div>{{$t('LuckyDraw.rewardText')}}</div>
            <span>{{balance + ' TRX'}}</span>
            <a @click="withdraw" class="withdraw" href="javascript:;">{{$t('LuckyDraw.withdraw')}}</a>
          </el-col> -->
        </el-row>
        <!-- 补充说明 -->
        <el-row class="supplement">
          <p>{{$t('LuckyDraw.supplement.p1')}}</p>
          <p>{{$t('LuckyDraw.supplement.p2')}}</p>
        </el-row>
        <!-- 解释权 -->
        <el-row class="explanation">
          <p>{{$t('vip.copyRight')}}</p>
        </el-row>
      </div>
    </div>
  </article>
</template>

<script>
/* 测试网地址 */
let contractAddress = "TSYuKXyV6pPcxcMJfaqZzt4KUBtncPPPC5";

export default {
  props: {
    visible: Boolean
  },
  data() {
    return {
      // 加载层
      isLoading: false,
      // 节流阀，防止用户多次点击
      flagObj: {
        draw: true,
        withdraw: true
      },
      // 幸运数字
      luckyNum: '请摇奖',
      // 奖金余额
      balance: 0,
      // 抽奖次数
      times: 0,
      // 合约对象
      contractObj: {},
      // 控制是否显示
      load: this.visible,
      // 奖金说明列表
      rewardList: this.getRewardList(),
      luckyNumShow: false
    };
  },
  async created() {
    /* 设置合约对象 */
    this.contractObj = await window.tronWeb.contract().at(this.$store.state.activityAddress);
    this.getTimes();
    this.getBalance();
    // this.contractObj.setLotterNumber('TN7KpFteYkkGUPM4wQ8uKRLCzq2M3ngkmc', 10).send()
    // this.getLuckyNum()
    console.log(this.contractObj);
  },
  methods: {
    /* 提现 */
    async withdraw() {
      if (this.flagObj.withdraw && this.balance !== 0) {
        this.isLoading = true;
        this.flagObj.withdraw = false;
        // 获取交易id
        let transctionId = await this.contractObj.withDraw(2).send();
        this.eventServer(
          transctionId,
          res => {
            let isSuccess = false;
            res.every(v => {
              if (v.name === "LuckWithDraw") {
                isSuccess = true;
              }
            });
            // 提现成功
            if (isSuccess) {
              this.balance = 0;
            }
            this.isLoading = false;
            this.flagObj.withdraw = true;
          },
          1000
        );
      }
    },
    /* 获取幸运数字 */
    async getLuckyNum() {
      if (this.flagObj.draw && this.times !== 0) {
        this.flagObj.draw = false;
        this.luckyNumShow = true;
        // 拿到交易id
        let transctionId = await this.contractObj.roll().send();
        // 幸运数字
        let randomTimer = setInterval(() => {
          this.luckyNum = Math.ceil(Math.random() * 10001) - 1;
        }, 60);
        // 查询事件服务器
        this.eventServer(transctionId, res => {
          clearInterval(randomTimer);
          // 设置响应的值
          res.every(v => {
            if (v.name === "GetRandom") {
              this.luckyNum = v.result._random;

              return false;
            }
          });
          // 刷新次数和奖金
          this.getTimes();
          this.getBalance();
          // 打开节流阀
          this.flagObj.draw = true;
        });
      }
    },
    /* 获取抽奖次数 */
    async getTimes() {
      let times = await this.contractObj.getLotterNumber().call();
      this.times = parseInt(times, 10);
    },
    /* 获取奖金余额 */
    async getBalance() {
      let balance = await this.contractObj.getLuckBalance().call();
      this.balance = parseInt(balance, 10) / Math.pow(10, 6);
    },
    /* 关闭弹层 */
    close() {
      this.load = false;
      this.$emit("update:visible", this.load);
    },
    /**
     * 事件服务器
     * @param {String} id 交易id
     * @param {Func} callback 回调函数
     * @param {Number} time 循环时间间隔， 默认3000ms
     */
    eventServer(id, callback, time = 3000) {
      // 查询事件服务器，拿到匹配结果
      let eventTimer = setInterval(async () => {
        // 拿到匹配事件返回值
        const res = await window.tronWeb.getEventByTransactionID(id);
        if (res.length !== 0) {
          // 清除定时器
          clearInterval(eventTimer);
          callback(res);
        }
      }, time);
    },
    /* 获取奖金说明列表 */
    getRewardList() {
      return [
        {
          number: "0 - 9885",
          reward: "0.1 TRX"
        },
        {
          number: "9886 - 9985",
          reward: "1 TRX"
        },
        {
          number: "9986 - 9993",
          reward: "10 TRX"
        },
        {
          number: "9994 - 9997",
          reward: "100 TRX"
        },
        {
          number: "9998 - 9999",
          reward: "1000 TRX"
        },
        {
          number: "10000",
          reward: "10000 TRX"
        }
      ];
    }
  }
};
</script>

<style lang="scss" scoped>
.lucky-num {
  color: #fff;
  background: url("../assets/images/float.png") no-repeat;
  background-size: 100% auto;
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  z-index: 5;
  width: 2.2rem;
  height: 0.42rem;
  top: -0.45rem;
  line-height: 0.35rem;
  font-size: 12px;
}
/* 打开动画 */
@keyframes dialogOpen {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.record {
  width: 100%;
  height: 0.54rem;
  background-color: #f5f6fa;
  border-radius: 0.08rem;
  margin-top: 0.1rem;
  padding: 0.12rem 0.21rem;
  .user-img {
    width: 0.32rem;
    height: 0.32rem;
  }

  font-size: 0.14rem;
  font-weight: normal;
  font-stretch: normal;
  color: #4648bf;
  .prize {
    line-height: 0.32rem;
  }

  .with-draw {
    height: 0.28rem;
    background-color: #4648bf;
    border-radius: 0.08rem;
    color: #fff;
  }
  margin-bottom: 0.1rem;
}

.root {
  .mask {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0px;
    left: 0px;
    background: rgba(26, 19, 19, 0.6);
    z-index: 99;
    .content {
      position: absolute;
      padding: 40px;
      width: 35%;
      height: 80%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      animation: dialogOpen 0.3s ease-in;
      .el-icon-close {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 16px;
        cursor: pointer;
        z-index: 10;
      }
      .title {
        width: 100%;
        text-align: center;
        font-weight: 500;
        font-size: 0.2306rem;
        line-height: 0.4rem;
        font-family: PingFangSC-Medium;

        margin-bottom: 10px;
        color: #0a0a30;
      }
      .list {
        width: 100%;
        td {
          width: 50%;
          padding: 5px 0px;
          text-align: center;
          border-bottom: 1px solid #e5e5e5;
          color: #0a0a30;
          height: 0.39rem;
        }
      }
      .lottery {
        margin-top: 10px;
        span {
          display: inline-block;
          height: 40px;
          line-height: 20px;
        }
        .roll {
          padding: 0 15px;
          height: 40px;
          // background: linear-gradient(0deg, #51b7ff 27%, #9a35ff 100%);
          outline-style: none;
          border: 0 none;
          color: #fff;
          cursor: pointer;
          background-color: #4648bf;
          border-radius: 25.36px;
        }
        .withdraw {
          color: skyblue;
          text-decoration: underline;
        }
      }
      .supplement {
        // margin-top: 20px;
        p {
          font-size: 13px;
          color: red;
          font-family: PingFangSC-Regular;
          font-size: 0.14rem;
          color: #0a0a30;
          margin-bottom: 0.1rem;
        }
      }
      .explanation {
        // margin-top: 20px;
        font-size: 12px;
        color: #0a0a30;
      }
    }
  }
}

@media (max-width: 750px) {
  .root {
    .mask {
      .content {
        font-size: 13px;
        padding: 10px;
        width: 95%;
      }
    }
  }

  .record {
    .btn-withdraw {
      width: 20%;
      .with-draw {
        height: 0.4rem;
      }
    }
  }
}

@media (min-width: 1600px) {
  .root {
    .mask {
      .content {
        font-size: 18px;
        padding: 10px;
        width: 35%;
        height: 75%;
        .explanation {
          font-size: 0.15rem;
        }
        .lottery {
          .roll {
            padding: 0 30px;
            height: 50px;
            font-size: 16px;
            margin: 20px 0;
          }
        }
        .supplement {
          p {
            font-size: 0.24rem;
            font-weight: 100;
          }
        }
        .list {
          td {
            height: 0.7rem;
          }
        }
      }
    }
  }

  .record {
    height: 0.65rem;
    .btn-withdraw {
      width: 20%;
      .with-draw {
        height: 0.4rem;
      }
    }
  }
}
</style>