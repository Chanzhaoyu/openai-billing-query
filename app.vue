<template>
  <div class="p-4 min-h-screen bg-[#01031d] text-white">
    <div class="max-w-screen-xl m-auto">
      <main class="space-y-4">
        <h1 class="my-8 text-3xl font-bold text-center">OpenAI Key 查询</h1>
        <div class="flex items-center justify-between">
          <h2 class="text-xl">
            输入 API Key
            <span class="ml-2 text-sm text-slate-400"> 本站不会保存 Key 信息，查询后请自行保存 </span>
          </h2>
          <button v-if="apiKeyInput.length > 0" class="btn btn-xs btn-outline btn-error" @click="handleClear">清空</button>
        </div>
        <div>
          <textarea
            v-model.trim="apiKeyInput"
            placeholder="请输入 API Key，必须包含 sk-，查询多个请换行"
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
          <span class="ml-2 text-sm text-slate-400"> 支持自定义线路，官网线路需要魔法 </span>
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
                    <td>
                      {{ keyHidden(item.key) }}
                    </td>
                    <td>
                      <span class="loading loading-spinner" v-if="item.loading"></span>
                      <template v-else>
                        <span v-if="item.checked">已检测</span>
                        <span v-else>未检测</span>
                      </template>
                    </td>
                    <template v-if="typeof item.isError === 'string' && item.isError.trim() !== ''">
                      <td class="text-red-500" colspan="7">
                        {{ item.isError }}
                        <a class="link link-accent" href="https://platform.openai.com/" target="_blank"> OpenAI</a>
                      </td>
                    </template>
                    <template v-else>
                      <td>{{ item.totalAmount }}</td>
                      <td>{{ item.totalUsage }}</td>
                      <td>{{ item.remaining }}</td>
                      <td>{{ item.expiryDate }}</td>
                      <td>{{ item.checked ? (item.hasGPT4 ? "Yes" : "No") : "" }}</td>
                      <td>{{ item.checked ? (item.isBindCard ? "Yes" : "No") : "" }}</td>
                      <td>
                        <label class="swap">
                          <input type="checkbox" />
                          <span class="flex items-center space-x-1 swap-on">
                            <svg class="fill-current" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path
                                d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z"
                              ></path>
                            </svg>
                            <span>{{ item.organizationId }}</span>
                          </span>
                          <span class="flex items-center space-x-1 swap-off">
                            <svg class="fill-current" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path
                                d="M9.34268 18.7819L7.41083 18.2642L8.1983 15.3254C7.00919 14.8874 5.91661 14.2498 4.96116 13.4534L2.80783 15.6067L1.39362 14.1925L3.54695 12.0392C2.35581 10.6103 1.52014 8.87466 1.17578 6.96818L3.14386 6.61035C3.90289 10.8126 7.57931 14.0001 12.0002 14.0001C16.4211 14.0001 20.0976 10.8126 20.8566 6.61035L22.8247 6.96818C22.4803 8.87466 21.6446 10.6103 20.4535 12.0392L22.6068 14.1925L21.1926 15.6067L19.0393 13.4534C18.0838 14.2498 16.9912 14.8874 15.8021 15.3254L16.5896 18.2642L14.6578 18.7819L13.87 15.8418C13.2623 15.9459 12.6376 16.0001 12.0002 16.0001C11.3629 16.0001 10.7381 15.9459 10.1305 15.8418L9.34268 18.7819Z"
                              ></path>
                            </svg>
                            <span>{{ organizationHidden(item.organizationId) }}</span>
                          </span>
                        </label>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div class="fixed text-sm text-center right-2 bottom-2 opacity-70">
      <a class="link link-accent" href="https://github.com/Chanzhaoyu/openai-billing-query" target="_blank">
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z"
            fill="rgba(255,255,255,1)"
          ></path>
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { strict } from "assert";

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
  isError?: string;
}

const apiKeyInput = ref<string>("");

const line = ref<"OpenAI" | "Proxy">("OpenAI");

const proxyUrl = ref<string>("");

const loading = computed(() => {
  return checkArray.value.some((item) => item.loading);
});

const checkArray = ref<KeyItem[]>([]);

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

function organizationHidden(organization?: string) {
  if (!organization) return organization;
  return organization.replace(/^(org-[a-zA-Z0-9]{4})[a-zA-Z0-9]*(.{6})$/, "$1***$2");
}

function handleClose(index: number) {
  if (loading.value) return;
  checkArray.value.splice(index, 1);
}

function handleClear() {
  apiKeyInput.value = "";
  checkArray.value = [];
}

async function handleQuery() {
  if (loading.value) return;

  // 清空之前的查询结果
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
      keyItem.isError = "API KEY 错误或账号被封，请登录 OpenAI 查看。";
      keyItem.loading = false;
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
    const totalUsage = (usageData.total_usage / 100).toFixed(3);

    keyItem.totalUsage = totalUsage;

    if (currentDate > expiryDate) {
      keyItem.remaining = "过期";
    } else {
      keyItem.remaining = (subscriptionData.system_hard_limit_usd - Number(totalUsage)).toFixed(3);
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
    keyItem.isError = "查询出现错误";
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
