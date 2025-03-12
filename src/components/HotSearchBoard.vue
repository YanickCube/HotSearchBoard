<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import { getHotSearchList, generateAIContent as fetchAIContent } from '../api.js';

// 热搜数据列表
const hotSearchList = reactive([]);

// 加载状态
const isLoadingHotSearch = ref(false);
const loadError = ref('');

// 获取热搜数据
const fetchHotSearchData = async () => {
  isLoadingHotSearch.value = true;
  loadError.value = '';
  
  try {
    const data = await getHotSearchList();
    // 清空原数组并添加新数据
    hotSearchList.splice(0, hotSearchList.length, ...data);
  } catch (error) {
    console.error('获取热搜数据失败:', error);
    loadError.value = error.message || '获取热搜数据失败，请稍后重试';
    ElNotification({
      title: '错误',
      message: loadError.value,
      type: 'error',
      duration: 5000
    });
  } finally {
    isLoadingHotSearch.value = false;
  }
};

// 组件挂载时获取热搜数据
onMounted(() => {
  fetchHotSearchData();
});


// 当前选中的热搜
const selectedHotSearch = ref(null);

// AI生成的图文内容
const aiGeneratedContent = ref('');
const aiGeneratedImage = ref('');
const isLoading = ref(false);
const aiError = ref('');

// 使用真实API生成AI内容
const generateAIContent = async (title) => {
  isLoading.value = true;
  aiError.value = '';
  
  try {
    const content = await fetchAIContent(title);
    // 确保文本内容正确处理，保留换行符
    aiGeneratedContent.value = content.text.trim();
    aiGeneratedImage.value = content.image;
  } catch (error) {
    console.error('生成AI内容失败:', error);
    aiError.value = error.message || '生成AI内容失败，请稍后重试';
    ElNotification({
      title: '错误',
      message: aiError.value,
      type: 'error',
      duration: 5000
    });
    
    // 设置默认内容
    aiGeneratedContent.value = `无法获取关于"${title}"的AI分析内容，请稍后重试。`;
    aiGeneratedImage.value = 'https://picsum.photos/600/400?random=0';
  } finally {
    isLoading.value = false;
  }
};

// 选择热搜项
const selectHotSearch = (item) => {
  selectedHotSearch.value = item;
  generateAIContent(item.title);
};

// 刷新热搜数据
const refreshHotSearch = () => {
  fetchHotSearchData();
  ElNotification({
    title: '提示',
    message: '正在刷新热搜数据...',
    type: 'info',
    duration: 2000
  });
};
</script>

<template>
  <div class="hot-search-container">
    <el-card class="hot-search-card">
      <div class="hot-search-header">
        <div class="header-content">
          <el-icon class="header-icon"><TrendCharts /></el-icon>
          <h1>今日热搜榜</h1>
        </div>
        <div class="header-actions">
          <p class="hot-search-date">
            <el-icon><Calendar /></el-icon>
            {{ new Date().toLocaleDateString() }}
          </p>
          <el-button type="primary" size="small" :icon="Refresh" @click="refreshHotSearch" :loading="isLoadingHotSearch">刷新</el-button>
        </div>
      </div>
      
      <div class="hot-search-content">
        <!-- 热搜列表 -->
        <div class="hot-search-list-container">
          <div class="list-header">
            <el-icon><List /></el-icon>
            <span>热搜话题</span>
          </div>
          <el-scrollbar height="550px">
            <div v-if="isLoadingHotSearch && hotSearchList.length === 0" class="hot-search-loading">
              <el-skeleton :rows="10" animated />
              <p class="loading-text">正在获取热搜数据...</p>
            </div>
            <div v-else-if="loadError && hotSearchList.length === 0" class="hot-search-error">
              <el-empty description="获取热搜数据失败">
                <template #description>
                  <p>{{ loadError }}</p>
                </template>
                <el-button type="primary" @click="fetchHotSearchData">重试</el-button>
              </el-empty>
            </div>
            <div v-else class="hot-search-list">
              <div 
                v-for="item in hotSearchList" 
                :key="item.id"
                class="hot-search-item"
                :class="{ 'active': selectedHotSearch && selectedHotSearch.id === item.id }"
                @click="selectHotSearch(item)"
              >
                <div class="hot-search-rank" :class="`rank-${item.rank <= 3 ? item.rank : 'normal'}`">{{ item.rank }}</div>
                <div class="hot-search-title">{{ item.title }}</div>
                <div class="hot-search-hot">
                  <el-icon><View /></el-icon>
                  {{ item.hot }}
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        
        <!-- AI生成内容展示区 -->
        <div class="ai-content-container">
          <div v-if="!selectedHotSearch" class="ai-content-placeholder">
            <el-empty description="请从左侧选择一条热搜">
              <template #image>
                <el-icon class="empty-icon"><Connection /></el-icon>
              </template>
              <template #description>
                <p>请从左侧选择一条热搜，AI将为您生成相关图文内容</p>
              </template>
            </el-empty>
          </div>
          
          <div v-else class="ai-content">
            <div class="ai-content-header">
              <h2>
                <el-tag size="large" effect="dark" class="topic-tag">热点话题</el-tag>
                {{ selectedHotSearch.title }}
              </h2>
              <el-tag type="danger" size="small" class="rank-tag">热度排名 #{{ selectedHotSearch.rank }}</el-tag>
            </div>
            
            <el-divider content-position="center">AI分析内容</el-divider>
            
            <div v-if="isLoading" class="ai-loading">
              <el-skeleton :rows="6" animated />
              <p>AI正在生成内容，请稍候...</p>
            </div>
            
            <div v-else class="ai-generated-content">
              <div class="ai-image-container">
                <el-image 
                  :src="aiGeneratedImage" 
                  alt="AI生成图片" 
                  class="ai-image"
                  :preview-src-list="[aiGeneratedImage]"
                  fit="cover"
                  loading="lazy"
                >
                  <template #placeholder>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              <el-card class="ai-text-card" shadow="hover">
                <template #header>
                  <div class="ai-text-header">
                    <el-icon><ChatLineRound /></el-icon>
                    <span>AI分析观点</span>
                  </div>
                </template>
                <div class="ai-text" v-html="aiGeneratedContent.replace(/\n/g, '<br>')" style="white-space: pre-line;"></div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.hot-search-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.hot-search-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hot-search-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.hot-search-header {
  text-align: center;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.header-icon {
  font-size: 2rem;
  color: #409EFF;
  margin-right: 15px;
}

.hot-search-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hot-search-date {
  font-size: 1rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.hot-search-content {
  display: flex;
  gap: 30px;
  height: 600px;
}

.hot-search-list-container {
  flex: 0 0 350px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
  font-size: 1.1rem;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.hot-search-list {
  flex: 1;
}

.hot-search-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.hot-search-item:hover {
  background-color: #f5f7fa;
}

.hot-search-item.active {
  background-color: #ecf5ff;
  border-left: 4px solid #409EFF;
}

.hot-search-item.active::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background-color: #409EFF;
}

.hot-search-rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  margin-right: 15px;
  background-color: #eee;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.hot-search-item:hover .hot-search-rank {
  transform: scale(1.1);
}

.rank-1 {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: white;
}

.rank-2 {
  background: linear-gradient(135deg, #ff7a45, #ff9c6e);
  color: white;
}

.rank-3 {
  background: linear-gradient(135deg, #ffa940, #ffc069);
  color: white;
}

.hot-search-title {
  flex: 1;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.hot-search-item:hover .hot-search-title {
  color: #409EFF;
}

.hot-search-hot {
  font-size: 0.85rem;
  color: #ff4d4f;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
}

.ai-content-container {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  padding: 20px;
}

.empty-icon {
  font-size: 5rem;
  color: #c0c4cc;
}

.ai-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ai-content-header h2 {
  font-size: 1.8rem;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.topic-tag {
  font-size: 0.9rem;
}

.rank-tag {
  font-size: 0.8rem;
}

.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 20px;
}

.ai-generated-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.ai-image {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.ai-image:hover {
  transform: scale(1.02);
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 300px;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 3rem;
}

.ai-text-card {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ai-text-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.ai-text-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  color: #303133;
}

.ai-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  text-align: justify;
  padding: 10px 0;
  overflow-wrap: break-word;
  word-break: break-word;
  max-height: none;
  overflow: visible;
}
</style>