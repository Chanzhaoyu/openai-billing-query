<template>
  <div class="p-4 pb-10 min-h-screen bg-[#01031d] text-white">
    <div class="max-w-screen-xl m-auto">
      <main class="space-y-4">
        <h1 class="my-8 text-3xl font-bold text-center">OpenAI Key 授信查询</h1>
        <div class="flex items-center justify-between">
          <h2 class="text-xl">
            输入 API KEY
            <span class="ml-2 text-base text-slate-500"> 本站不保存 KEY 信息，查询后请自行保存 </span>
          </h2>
          <button v-if="apiKeyInput.length > 0" class="btn btn-xs btn-outline btn-error" @click="handleClear">清空</button>
        </div>
        <div>
          <textarea
            v-model.trim="apiKeyInput"
            placeholder="请输入 API-KEY，必须包含 sk-，查询多个请换行"
            class="w-full textarea textarea-bordered textarea-lg text-slate-700"
            @blur="filterKeys"
          />
        </div>
        <div v-if="checkArray.length > 0">
          <div class="flex items-center justify-between mb-2">
            <span>已识别：</span>
          </div>
          <div class="p-4 border rounded-md border-slate-700">
            <ul class="space-y-4">
              <li v-for="(item, index) of checkArray" class="flex items-center" :key="index">
                <span>{{ index + 1 }}、</span>
                <span>{{ item.key }}</span>
                <button class="ml-4 btn btn-xs btn-outline btn-error" @click="handleClose(index)">x</button>
              </li>
            </ul>
          </div>
        </div>
        <h2 class="text-xl">
          查询线路
          <span class="ml-2 text-base text-slate-500"> 支持自定义线路，官网线路需要魔法 </span>
        </h2>
        <div>
          <select v-model="line" :disabled="loading" class="w-full max-w-xs select select-bordered text-slate-700">
            <option value="OpenAI">官方线路</option>
            <option value="Proxy">自定义</option>
          </select>
        </div>
        <div v-if="line === 'Proxy'">
          <input v-model.trim="proxyUrl" type="text" placeholder="输入自定义API，默认使用 https 协议" class="w-full input input-bordered text-slate-700" />
        </div>
        <button class="btn btn-active btn-primary btn-block" @click="handleQuery">
          {{ loading ? "查询中..." : "查询" }}
        </button>
        <div class="space-y-4" v-if="checkArray.length > 0">
          <h2 class="text-xl">查询结果</h2>
          <div>
            <div class="overflow-x-auto">
              <table class="table">
                <thead class="text-base text-slate-200">
                  <tr>
                    <th>序号</th>
                    <th>API KEY</th>
                    <th>检测</th>
                    <th>总额度</th>
                    <th>已使用</th>
                    <th>剩余量</th>
                    <th>到期时间</th>
                    <th>GPT-4</th>
                    <th>绑卡</th>
                    <th>组织ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) of checkArray" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ keyHidden(item.key) }}</td>
                    <td>
                      <span class="loading loading-spinner" v-if="item.loading"></span>
                      <template v-else>
                        <span v-if="item.checked">已检测</span>
                        <span v-else>未检测</span>
                      </template>
                    </td>
                    <template v-if="typeof item.error === 'string' && item.error.trim() !== ''">
                      <td colspan="7">{{ item.error }}</td>
                    </template>
                    <template v-else>
                      <td>{{ item.totalAmount }}</td>
                      <td>{{ item.totalUsage }}</td>
                      <td>{{ item.remaining }}</td>
                      <td>{{ item.expiryDate }}</td>
                      <td>{{ item.checked ? (item.hasGPT4 ? "Yes" : "No") : "" }}</td>
                      <td>{{ item.checked ? (item.isBindCard ? "Yes" : "No") : "" }}</td>
                      <td>{{ item.organizationId }}</td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div class="absolute w-full bottom-2 left-0 text-center">
      GitHub
      <a class="link link-accent" href="https://github.com/Chanzhaoyu/openai-billing-query" target="_blank">Chanzhaoyu</a>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KeyItem {
  key: string;
  loading: boolean;
  checked: boolean;
  totalUsage?: number | string;
  totalAmount?: number | string;
  expiryDate?: string;
  hasGPT4?: boolean;
  isBindCard?: boolean;
  remaining?: number | string;
  organizationId?: string;
  error?: string;
}

const apiKeyInput = ref<string>("");

const line = ref<"OpenAI" | "Proxy">("OpenAI");

const proxyUrl = ref<string>("");

const checkArray = ref<KeyItem[]>([]);

const loading = computed<boolean>(() => {
  return checkArray.value.some((item) => (item.loading = true));
});

function filterKeys() {
  const keys = apiKeyInput.value.split(/[,\s，\n]+/).filter((key) => key.startsWith("sk-"));

  const keysArray: KeyItem[] = [];

  keys.forEach((item) => {
    keysArray.push({
      key: item,
      loading: false,
      checked: false,
    });
  });

  checkArray.value = keysArray;
}

function keyHidden(apiKey: string) {
  return apiKey.replace(/^(sk-[a-zA-Z0-9]{4})[a-zA-Z0-9]*(.{6})$/, "$1***$2");
}

function handleClose(index: number) {
  if (loading.value) return window.alert('正在查询中，请稍后再试！');
  checkArray.value.splice(index, 1);
}

function handleClear() {
  apiKeyInput.value = "";
  checkArray.value = [];
}

async function handleQuery() {
  if (loading.value) return;

  checkArray.value = [];

  // 进行匹配
  if (apiKeyInput.value.length > 0 && checkArray.value.length === 0) {
    filterKeys();
  }

  let apiUrl = "";
  if (line.value === "Proxy") {
    if (proxyUrl.value.trim() === "") {
      window.alert("请输入自定义 API URL");
      return;
    } else {
      apiUrl = proxyUrl.value.trim();
      if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
        apiUrl = "https://" + apiUrl;
      }
    }
  } else {
    apiUrl = "https://api.openai.com";
  }

  if (checkArray.value.length === 0) {
    window.alert("未匹配到最少一个 API Key");
    return;
  }

  for (let i = 0; i < checkArray.value.length; i++) {
    checkBilling(checkArray.value[i], apiUrl);
  }
}

async function checkBilling(keyItem: KeyItem, apiUrl: string) {
  const apiKey = keyItem.key;

  const now = new Date();

  // 开始时间和结束时间
  const before90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const after24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  let startDate = formatDate(before90Days);
  let endDate = formatDate(after24Hours);

  let subDate = new Date(now);
  subDate.setDate(1);

  // 设置 API 请求 URL 和请求头
  const headers = {
    Authorization: "Bearer " + apiKey,
    "Content-Type": "application/json",
  };

  const urlGPT4Check = `${apiUrl}/v1/models`;
  const urlSubscription = `${apiUrl}/v1/dashboard/billing/subscription`;
  let urlUsage = `${apiUrl}/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`;
  const urlOrganization = `${apiUrl}/v1/organizations`;

  try {
    // 获取 API 限额
    keyItem.loading = true;
    let response = await fetch(urlSubscription, { headers });
    if (!response.ok) {
      keyItem.error = "API KEY 错误或账号被封，请登录 OpenAI 查看。";
      return;
    }

    let currentDate = new Date();

    // 获取 API 限额
    const subscriptionData = await response.json();
    const totalAmount = subscriptionData.system_hard_limit_usd;
    keyItem.totalAmount = Number(totalAmount).toFixed(2) ?? 0;

    const expiryDate = new Date(subscriptionData.access_until * 1000 + 8 * 60 * 60 * 1000);
    keyItem.expiryDate = formattedExpiryDate(expiryDate);

    // 是否有 GPT-4
    const gpt4CheckResponse = await fetch(urlGPT4Check, { headers });
    const gpt4CheckData = await gpt4CheckResponse.json();
    const GPT4CheckResult = Array.isArray(gpt4CheckData.data) && gpt4CheckData.data.some((item: any) => item.id.includes("gpt-4"));
    keyItem.hasGPT4 = GPT4CheckResult;

    // 是否绑卡
    const isBind = subscriptionData.plan.id.includes("payg");
    keyItem.isBindCard = isBind;

    const usageResponse = await fetch(urlUsage, { headers });
    const usageData = await usageResponse.json();
    const totalUsage = (usageData.total_usage / 100).toFixed(2);

    keyItem.totalUsage = totalUsage;

    if (currentDate > expiryDate) {
      keyItem.remaining = "过期";
    } else {
      keyItem.remaining = subscriptionData.system_hard_limit_usd - Number(totalUsage);
    }

    const organizationResponse = await fetch(urlOrganization, { headers });
    const organizationData = await organizationResponse.json();

    if (typeof organizationData.data[1] !== "undefined") {
      keyItem.organizationId = organizationData.data[0].id + "----" + organizationData.data[1].id;
    } else {
      keyItem.organizationId = organizationData.data[0].id;
    }

    return Promise.resolve();
  } catch (error) {
    keyItem.error = '请求出错'
    return Promise.reject(error);
  } finally {
    keyItem.checked = true;
    keyItem.loading = false;
  }
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formattedExpiryDate(expiryDate: Date) {
  return `${expiryDate.getFullYear()}-${(expiryDate.getMonth() + 1).toString().padStart(2, "0")}-${expiryDate.getDate().toString().padStart(2, "0")}`;
}
</script>
