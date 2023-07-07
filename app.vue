<template>
  <div class="p-4 min-h-screen bg-[#01031d] text-white">
    <div class="max-w-screen-xl m-auto">
      <main class="space-y-4">
        <h1 class="my-8 text-3xl font-bold text-center">OpenAI Key 授信查询</h1>
        <div class="flex items-center justify-between">
          <h2 class="text-xl">
            输入 API KEY
            <span class="ml-2 text-base text-slate-500">
              本站不保存 KEY 信息，查询后请自行保存
            </span>
          </h2>
          <button
            v-if="apiKeyInput.length > 0"
            class="btn btn-xs btn-outline btn-error"
            @click="handleClear"
          >
            清空
          </button>
        </div>
        <div>
          <textarea
            v-model.trim="apiKeyInput"
            placeholder="请输入 API-KEY，必须包含 sk-，多个可直接粘贴"
            class="w-full textarea textarea-bordered textarea-lg text-slate-700"
            @blur="filterKeys"
          />
        </div>
        <div v-if="keysArray.length > 0">
          <div class="flex items-center justify-between mb-2">
            <span>已识别：</span>
          </div>
          <div class="p-4 border rounded-md border-slate-700">
            <ul class="space-y-4">
              <li
                v-for="(item, index) of keysArray"
                class="flex items-center"
                :key="index"
              >
                <span>{{ index + 1 }}、</span>
                <span>{{ item }}</span>
                <button
                  class="ml-4 btn btn-xs btn-outline btn-error"
                  @click="handleClose(index)"
                >
                  x
                </button>
              </li>
            </ul>
          </div>
        </div>
        <h2 class="text-xl">
          查询线路
          <span class="ml-2 text-base text-slate-500">
            支持自定义线路，官网线路需要魔法
          </span>
        </h2>
        <div>
          <select
            v-model="line"
            class="w-full max-w-xs select select-bordered text-slate-700"
          >
            <option value="OpenAI">官方线路</option>
            <option value="Proxy">自定义</option>
          </select>
        </div>
        <div v-if="line === 'Proxy'">
          <input
            v-model.trim="proxyUrl"
            type="text"
            placeholder="输入自定义API，默认使用 https 协议"
            class="w-full input input-bordered text-slate-700"
          />
        </div>
        <button
          class="btn btn-active btn-primary btn-block"
          :disabled="loading"
          @click="handleQuery"
        >
          <span class="loading loading-spinner" v-if="loading"></span>
          查询
        </button>
        <div class="space-y-4" v-if="result.length > 0">
          <h2 class="text-xl">查询结果</h2>
          <div>
            <div class="overflow-x-auto">
              <table class="table">
                <thead class="text-base text-slate-200">
                  <tr>
                    <th>序号</th>
                    <th>API KEY</th>
                    <th>总额度</th>
                    <th>已使用</th>
                    <th>剩余量</th>
                    <th>已用比例</th>
                    <th>到期时间</th>
                    <th>GPT-4</th>
                    <th>绑卡</th>
                    <th>组织ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) of result" :key="index">
                    <td>1</td>
                    <td>sk-JTLe***suUf6Q</td>
                    <td>120.00</td>
                    <td>0.32</td>
                    <td>119.68</td>
                    <td>0.26%</td>
                    <td>2023-08-01</td>
                    <td>No</td>
                    <td>Yes</td>
                    <td>org-fUSYjc4LV3O1pp14oK3pGmrW</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const apiKeyInput = ref<string>("");

const keysArray = ref<string[]>([]);

const line = ref<"OpenAI" | "Proxy">("OpenAI");

const proxyUrl = <string>"";

const loading = ref(false);

const result = ref<any[]>([]);

function filterKeys() {
  keysArray.value = apiKeyInput.value
    .split(/[,\s，\n]+/)
    .filter((key) => key.startsWith("sk-"))
    .map((item) => item.trim());
}

function handleClose(index: number) {
  keysArray.value.splice(index, 1);
}

function handleClear() {
  apiKeyInput.value = "";
  keysArray.value = [];
}

async function handleQuery() {}

async function checkBilling(apiKey: string, apiUrl: string) {}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
</script>
