/**
 * API服务
 * 封装热搜API和大模型API的调用
 */
import axios from 'axios';

// API配置
const DOUYIN_API_KEY = '65c484075e7293953d062ce225926e99';
const DOUYIN_API_URL = 'https://apis.tianapi.com/douyinhot/index';

const LLM_API_KEY = 'sk-xjbjsnfsviyvspdjfrbqvgynegbkngmpuancfadmiobqqbgb';
const LLM_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

/**
 * 获取抖音热搜榜单数据
 * @returns {Promise<Array>} 热搜数据列表
 */
export async function getHotSearchList() {
  try {
    const response = await axios.get(DOUYIN_API_URL, {
      params: {
        key: DOUYIN_API_KEY
      }
    });
    
    if (response.data.code === 200) {
      // 转换API返回的数据格式为组件所需格式
      return response.data.result.list.map((item, index) => ({
        id: index + 1,
        title: item.word,
        hot: formatHotIndex(item.hotindex),
        rank: index + 1,
        label: item.label // 标签类型：1新，2荐，3热
      }));
    } else {
      console.error('获取热搜数据失败:', response.data.msg);
      throw new Error(`获取热搜数据失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('获取热搜数据出错:', error);
    throw error;
  }
}

/**
 * 使用大模型生成关于热搜话题的分析内容
 * @param {string} topic 热搜话题
 * @returns {Promise<Object>} 包含文本分析和图片URL的对象
 */
export async function generateAIContent(topic) {
  try {
    const response = await axios.post(LLM_API_URL, {
      model: "Qwen/QwQ-32B",
      messages: [
        {
          role: "user",
          content: `请对以下热搜话题进行分析并提供相关观点：${topic}。请提供300字左右的分析，语言要幽默，观点要犀利。`
        }
      ],
      stream: false,
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      n: 1,
      response_format: {
        type: "text"
      }
    }, {
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 从响应中提取AI生成的文本
    // 循环获取所有choices中的message.content并合并
    let aiText = '';
    if (response.data.choices && response.data.choices.length > 0) {
      aiText = response.data.choices.map(choice => choice.message.content).join('\n\n');
    }
    
    // 为话题生成一个随机图片URL（实际项目中可以使用图像生成API）
    const imageUrl = `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 100)}`;
    
    return {
      text: aiText,
      image: imageUrl
    };
  } catch (error) {
    console.error('生成AI内容出错:', error);
    throw error;
  }
}

/**
 * 格式化热度指数为易读形式
 * @param {number} hotindex 热度指数
 * @returns {string} 格式化后的热度字符串
 */
function formatHotIndex(hotindex) {
  if (hotindex >= 10000) {
    return `${(hotindex / 10000).toFixed(1)}万`;
  }
  return String(hotindex);
}