<template>
  <admin-layout>
    <div class="process-manage-container">
      <div class="page-header">
        <h2 class="chinese-title">流程管理</h2>
        <div class="header-actions">
          <el-select v-model="currentProcessCategory" placeholder="选择流程分类" class="mr-10">
            <el-option label="白事流程" :value="0" />
            <el-option label="喜事流程" :value="1" />
            <el-option label="生日宴流程" :value="2" />
            <el-option label="满月宴流程" :value="3" />
            <el-option label="其他流程" :value="9" />
          </el-select>
          
          <el-button type="primary" class="traditional-btn" @click="handleAddCategory">
            <el-icon><el-icon-plus /></el-icon> 添加流程分类
          </el-button>
          
          <el-button type="primary" class="traditional-btn ml-10" @click="handleAddProcess">
            <el-icon><el-icon-plus /></el-icon> 添加步骤
          </el-button>
        </div>
      </div>
      
      <!-- 流程展示 -->
      <div class="process-timeline traditional-card">
        <div v-if="processList.length === 0" class="empty-state">
          <el-empty description="暂无流程数据" />
        </div>
        
        <el-timeline v-else>
          <el-timeline-item
            v-for="(item, index) in processList"
            :key="index"
            :type="getProcessNodeType(item)"
            :color="getProcessNodeColor(item)"
            :timestamp="'步骤 ' + (index + 1)"
            placement="top"
          >
            <div class="process-card" :class="getProcessCardClass(item)">
              <div class="process-header">
                <h3>{{ item.stepName }}</h3>
                <div class="process-actions">
                  <el-tooltip content="编辑步骤" placement="top">
                    <el-button 
                      size="small" 
                      type="primary"
                      plain
                      @click="handleEdit(item, index)"
                    >
                      <el-icon><el-icon-edit /></el-icon> 编辑
                    </el-button>
                  </el-tooltip>
                  
                  <el-tooltip content="上移步骤" placement="top">
                    <el-button 
                      size="small" 
                      type="info"
                      plain
                      @click="handleMoveUp(index)" 
                      :disabled="index === 0"
                    >
                      <el-icon><el-icon-arrow-up /></el-icon> 上移
                    </el-button>
                  </el-tooltip>
                  
                  <el-tooltip content="下移步骤" placement="top">
                    <el-button 
                      size="small" 
                      type="info"
                      plain
                      @click="handleMoveDown(index)" 
                      :disabled="index === processList.length - 1"
                    >
                      <el-icon><el-icon-arrow-down /></el-icon> 下移
                    </el-button>
                  </el-tooltip>
                  
                  <el-tooltip content="删除步骤" placement="top">
                    <el-popconfirm
                      title="确定要删除该流程步骤吗？"
                      @confirm="handleDelete(item, index)"
                    >
                      <template #reference>
                        <el-button 
                          size="small" 
                          type="danger"
                          plain
                        >
                          <el-icon><el-icon-delete /></el-icon> 删除
                        </el-button>
                      </template>
                    </el-popconfirm>
                  </el-tooltip>
                </div>
              </div>
              
              <div class="process-description">
                {{ item.description }}
              </div>
              
              <div class="timeline-divider"></div>
              
              <div class="process-resources">
                <div class="resource-section" v-if="item.products && item.products.length > 0">
                  <h4>关联商品 ({{ item.products.length }})</h4>
                  <el-tag 
                    v-for="(product, pidx) in item.products" 
                    :key="pidx"
                    class="resource-tag"
                  >
                    {{ product.name }}
                  </el-tag>
                </div>
                
                <div class="resource-section" v-if="item.suppliers && item.suppliers.length > 0">
                  <h4>关联供应商 ({{ item.suppliers.length }})</h4>
                  <el-tag 
                    v-for="(supplier, sidx) in item.suppliers" 
                    :key="sidx"
                    class="resource-tag"
                    type="info"
                  >
                    {{ supplier.name }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
    
    <!-- 添加/编辑流程步骤对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="processForm" :rules="processRules" ref="processFormRef" label-width="100px">
        <el-form-item label="流程分类" prop="category">
          <el-select v-model="processForm.category" placeholder="请选择流程分类" style="width: 100%">
            <el-option label="白事流程" :value="0" />
            <el-option label="喜事流程" :value="1" />
            <el-option label="生日宴流程" :value="2" />
            <el-option label="满月宴流程" :value="3" />
            <el-option label="其他流程" :value="9" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="步骤名称" prop="stepName">
          <el-input v-model="processForm.stepName" placeholder="请输入步骤名称" />
        </el-form-item>
        
        <el-form-item label="步骤说明" prop="description">
          <el-input
            v-model="processForm.description"
            type="textarea"
            rows="4"
            placeholder="请输入步骤详细说明"
          />
        </el-form-item>
        
        <el-form-item label="关联商品">
          <el-select
            v-model="processForm.productIds"
            multiple
            filterable
            placeholder="请选择关联商品"
            style="width: 100%"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="关联供应商">
          <el-select
            v-model="processForm.supplierIds"
            multiple
            filterable
            placeholder="请选择关联供应商"
            style="width: 100%"
          >
            <el-option
              v-for="item in supplierOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            class="traditional-btn" 
            @click="submitProcessForm"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 添加流程分类对话框 -->
    <el-dialog
      title="添加流程分类"
      v-model="categoryDialogVisible"
      width="400px"
    >
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类编码" />
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '../components/AdminLayout.vue'

// 当前流程分类
const currentProcessCategory = ref(0)

// 流程列表
const processList = ref([
  {
    id: 1,
    category: 0,
    stepName: '报丧',
    description: '家属需通知亲友，并联系村委会登记。准备挂白、放哀乐等仪式。',
    products: [
      { id: 1, name: '白布条' },
      { id: 2, name: '音响设备' }
    ],
    suppliers: [
      { id: 2, name: '丧葬用品供应商' }
    ]
  },
  {
    id: 2,
    category: 0,
    stepName: '入殓',
    description: '为逝者沐浴、更衣、入殓，需准备寿衣等物品。',
    products: [
      { id: 3, name: '寿衣-棉麻款' },
      { id: 4, name: '寿衣-丝绸款' }
    ],
    suppliers: [
      { id: 2, name: '丧葬用品供应商' }
    ]
  },
  {
    id: 3,
    category: 0,
    stepName: '守灵',
    description: '灵堂布置，亲友守灵、吊唁，需准备花圈、祭品等。',
    products: [
      { id: 5, name: '花圈-标准款' },
      { id: 6, name: '祭品套装' }
    ],
    suppliers: []
  },
  {
    id: 4,
    category: 0,
    stepName: '出殡',
    description: '出殡仪式，送别逝者。需要车辆、乐队等。',
    products: [
      { id: 7, name: '灵车服务' },
      { id: 8, name: '乐队服务' }
    ],
    suppliers: []
  },
  {
    id: 5,
    category: 1,
    stepName: '订婚仪式',
    description: '家长见面，互换礼物，确定婚期。',
    products: [
      { id: 13, name: '喜糖礼盒' },
      { id: 14, name: '订婚酒' }
    ],
    suppliers: [
      { id: 1, name: '喜宴酒席供应商' }
    ]
  },
  {
    id: 6,
    category: 1,
    stepName: '婚礼布置',
    description: '婚礼现场布置，包括气球、拱门、桌椅等。',
    products: [
      { id: 9, name: '婚庆拱门' },
      { id: 15, name: '婚礼气球装饰' }
    ],
    suppliers: [
      { id: 1, name: '喜宴酒席供应商' }
    ]
  },
  {
    id: 7,
    category: 1,
    stepName: '接亲仪式',
    description: '新郎前往新娘家接亲，包括闯关游戏等。',
    products: [
      { id: 11, name: '婚车装饰' }
    ],
    suppliers: []
  },
  {
    id: 8,
    category: 1,
    stepName: '婚宴',
    description: '举办婚宴，宴请亲友。',
    products: [
      { id: 10, name: '喜宴餐具套装' },
      { id: 12, name: '婚庆音响设备' }
    ],
    suppliers: [
      { id: 1, name: '喜宴酒席供应商' }
    ]
  }
])

// 可选商品
const productOptions = ref([
  { id: 1, name: '白布条', category: 0 },
  { id: 2, name: '音响设备', category: 0 },
  { id: 3, name: '寿衣-棉麻款', category: 0 },
  { id: 4, name: '寿衣-丝绸款', category: 0 },
  { id: 5, name: '花圈-标准款', category: 0 },
  { id: 6, name: '祭品套装', category: 0 },
  { id: 7, name: '灵车服务', category: 0 },
  { id: 8, name: '乐队服务', category: 0 },
  { id: 9, name: '婚庆拱门', category: 1 },
  { id: 10, name: '喜宴餐具套装', category: 1 },
  { id: 11, name: '婚车装饰', category: 1 },
  { id: 12, name: '婚庆音响设备', category: 1 },
  { id: 13, name: '喜糖礼盒', category: 1 },
  { id: 14, name: '订婚酒', category: 1 },
  { id: 15, name: '婚礼气球装饰', category: 1 },
  { id: 16, name: '蛋糕', category: 2 },
  { id: 17, name: '生日礼品', category: 2 },
  { id: 18, name: '满月礼盒', category: 3 },
  { id: 19, name: '水果礼篮', category: 9 },
])

// 可选供应商
const supplierOptions = ref([
  { id: 1, name: '喜宴酒席供应商', type: 1 },
  { id: 2, name: '丧葬用品供应商', type: 2 },
  { id: 3, name: '水果生鲜供应基地', type: 3 },
])

// 流程分类
const processCategories = ref([
  { id: 0, name: '白事流程', code: 'funeral', sort: 1 },
  { id: 1, name: '喜事流程', code: 'wedding', sort: 2 },
  { id: 2, name: '生日宴流程', code: 'birthday', sort: 3 },
  { id: 3, name: '满月宴流程', code: 'fullmoon', sort: 4 },
  { id: 9, name: '其他流程', code: 'other', sort: 9 },
])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加流程步骤')
const processFormRef = ref(null)

// 分类对话框相关
const categoryDialogVisible = ref(false)
const categoryFormRef = ref(null)

// 流程表单
const processForm = reactive({
  id: 0,
  category: 0,
  stepName: '',
  description: '',
  productIds: [],
  supplierIds: []
})

// 分类表单
const categoryForm = reactive({
  name: '',
  code: '',
  sort: 0
})

// 表单验证规则
const processRules = {
  stepName: [
    { required: true, message: '请输入步骤名称', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入步骤说明', trigger: 'blur' },
  ]
}

// 分类表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入分类编码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: '编码只能包含字母、数字、下划线和连字符', trigger: 'blur' },
  ]
}

// 监听分类变化
watch(currentProcessCategory, (newVal) => {
  loadProcessList()
})

// 初始化
onMounted(() => {
  loadProcessList()
})

// 加载流程列表
const loadProcessList = () => {
  // 根据当前分类过滤流程
  processList.value = processList.value.filter(item => item.category === currentProcessCategory.value)
}

// 获取流程节点类型
const getProcessNodeType = (item) => {
  return 'primary'
}

// 获取流程节点颜色
const getProcessNodeColor = (item) => {
  const colorMap = {
    0: 'var(--memorial-color)',   // 白事
    1: 'var(--happy-color)',      // 喜事
    2: '#409EFF',                 // 生日宴
    3: '#67C23A',                 // 满月宴
    9: '#909399'                  // 其他
  }
  return colorMap[item.category] || '#909399'
}

// 获取流程卡片样式类
const getProcessCardClass = (item) => {
  const classMap = {
    0: 'memorial-card',  // 白事
    1: 'happy-card',     // 喜事
    2: 'birthday-card',  // 生日宴
    3: 'fullmoon-card',  // 满月宴
    9: 'other-card'      // 其他
  }
  return classMap[item.category] || 'other-card'
}

// 添加流程分类
const handleAddCategory = () => {
  categoryForm.name = ''
  categoryForm.code = ''
  categoryForm.sort = 0
  categoryDialogVisible.value = true
}

// 提交分类表单
const submitCategoryForm = () => {
  categoryFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        const newId = Math.max(...processCategories.value.map(c => c.id)) + 1
        processCategories.value.push({
          id: newId,
          name: categoryForm.name,
          code: categoryForm.code,
          sort: categoryForm.sort
        })
        
        ElMessage.success('添加分类成功')
        categoryDialogVisible.value = false
      }, 500)
    }
  })
}

// 添加流程
const handleAddProcess = () => {
  resetProcessForm()
  dialogTitle.value = '添加流程步骤'
  processForm.category = currentProcessCategory.value
  dialogVisible.value = true
}

// 编辑流程
const handleEdit = (item, index) => {
  resetProcessForm()
  dialogTitle.value = '编辑流程步骤'
  
  processForm.id = item.id
  processForm.category = item.category
  processForm.stepName = item.stepName
  processForm.description = item.description
  processForm.productIds = item.products ? item.products.map(p => p.id) : []
  processForm.supplierIds = item.suppliers ? item.suppliers.map(s => s.id) : []
  
  dialogVisible.value = true
}

// 重置流程表单
const resetProcessForm = () => {
  if (processFormRef.value) {
    processFormRef.value.resetFields()
  }
  
  processForm.id = 0
  processForm.category = currentProcessCategory.value
  processForm.stepName = ''
  processForm.description = ''
  processForm.productIds = []
  processForm.supplierIds = []
}

// 提交流程表单
const submitProcessForm = () => {
  processFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        dialogVisible.value = false
        
        // 将选择的商品ID转换为商品对象
        const selectedProducts = productOptions.value.filter(p => 
          processForm.productIds.includes(p.id)
        )
        
        // 将选择的供应商ID转换为供应商对象
        const selectedSuppliers = supplierOptions.value.filter(s => 
          processForm.supplierIds.includes(s.id)
        )
        
        // 如果是编辑，找到对应项并更新
        if (processForm.id > 0) {
          const index = processList.value.findIndex(item => item.id === processForm.id)
          if (index !== -1) {
            processList.value[index] = {
              ...processForm,
              products: selectedProducts,
              suppliers: selectedSuppliers
            }
          }
        } else {
          // 添加新步骤
          const newId = Math.max(0, ...processList.value.map(item => item.id)) + 1
          
          processList.value.push({
            id: newId,
            category: processForm.category,
            stepName: processForm.stepName,
            description: processForm.description,
            products: selectedProducts,
            suppliers: selectedSuppliers
          })
        }
        
        // 提示
        ElMessage.success(dialogTitle.value === '添加流程步骤' ? '添加成功' : '更新成功')
      }, 500)
    }
  })
}

// 上移步骤
const handleMoveUp = (index) => {
  if (index > 0) {
    const temp = processList.value[index]
    processList.value[index] = processList.value[index - 1]
    processList.value[index - 1] = temp
  }
}

// 下移步骤
const handleMoveDown = (index) => {
  if (index < processList.value.length - 1) {
    const temp = processList.value[index]
    processList.value[index] = processList.value[index + 1]
    processList.value[index + 1] = temp
  }
}

// 删除步骤
const handleDelete = (item, index) => {
  ElMessageBox.confirm('确定要删除该流程步骤吗？此操作不可恢复', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    processList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ml-10 {
  margin-left: 10px;
}

.mr-10 {
  margin-right: 10px;
}

.process-timeline {
  padding: 30px;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%), url('../assets/images/pattern.svg');
  background-size: 200px;
}

.empty-state {
  padding: 50px 0;
  text-align: center;
}

.process-card {
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.12);
  }
  
  &.memorial-card {
    border-left: 4px solid var(--memorial-color);
  }
  
  &.happy-card {
    border-left: 4px solid var(--happy-color);
  }
  
  &.birthday-card {
    border-left: 4px solid #409EFF;
  }
  
  &.fullmoon-card {
    border-left: 4px solid #67C23A;
  }
  
  &.other-card {
    border-left: 4px solid #909399;
  }
  
  .process-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
    }

    .process-actions {
      display: flex;
      gap: 5px;
    }
  }
  
  .process-description {
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 15px;
    font-size: 15px;
  }
  
  .timeline-divider {
    height: 1px;
    background-color: #ebeef5;
    margin: 20px 0;
  }
  
  .process-resources {
    .resource-section {
      margin-bottom: 15px;
      
      h4 {
        margin: 10px 0;
        font-size: 15px;
        color: var(--text-secondary);
      }
      
      .resource-tag {
        margin-right: 10px;
        margin-bottom: 10px;
        font-size: 13px;
        padding: 6px 12px;
      }
    }
  }
}
</style> 