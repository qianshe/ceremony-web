<template>
  <admin-layout>
    <div class="supplier-container">
      <div class="page-header">
        <h2 class="chinese-title">供应商管理</h2>
        <el-button 
          type="primary" 
          class="traditional-btn" 
          @click="handleAddSupplier"
        >
          <el-icon><el-icon-plus /></el-icon> 新增供应商
        </el-button>
      </div>
      
      <!-- 搜索表单 -->
      <div class="search-form traditional-card">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="供应商名称">
            <el-input v-model="searchForm.name" placeholder="请输入供应商名称" clearable />
          </el-form-item>
          
          <el-form-item label="联系电话">
            <el-input v-model="searchForm.phone" placeholder="请输入联系电话" clearable />
          </el-form-item>
          
          <el-form-item label="供应商类型">
            <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
              <el-option label="普通供应商" :value="0" />
              <el-option label="红事供应商" :value="1" />
              <el-option label="白事供应商" :value="2" />
              <el-option label="生鲜供应商" :value="3" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><el-icon-search /></el-icon> 查询
            </el-button>
            <el-button @click="resetSearchForm">
              <el-icon><el-icon-refresh /></el-icon> 重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 供应商列表 -->
      <div class="traditional-card mt-20">
        <el-table
          :data="supplierList"
          style="width: 100%"
          v-loading="loading"
          border
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          
          <el-table-column prop="name" label="供应商名称" min-width="150" show-overflow-tooltip />
          
          <el-table-column prop="contactPerson" label="联系人" width="100" />
          
          <el-table-column prop="phone" label="联系电话" width="130" />
          
          <el-table-column prop="type" label="供应商类型" width="120">
            <template #default="scope">
              <el-tag 
                :type="getSupplierTagType(scope.row.type)"
                effect="plain"
              >
                {{ getSupplierTypeText(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
          
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                @change="(val) => handleStatusChange(scope.row, val)"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button link type="primary" @click="handleViewSupplier(scope.row)">
                查看
              </el-button>
              <el-button link type="success" @click="handleEditSupplier(scope.row)">
                编辑
              </el-button>
              <el-popconfirm
                title="确定删除该供应商吗?"
                @confirm="handleDeleteSupplier(scope.row)"
              >
                <template #reference>
                  <el-button link type="danger">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            :current-page="pagination.currentPage"
            :page-size="pagination.pageSize"
            @update:current-page="pagination.currentPage = $event"
            @update:page-size="pagination.pageSize = $event"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      
      <!-- 供应商编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑供应商' : '新增供应商'"
        width="600px"
      >
        <el-form
          :model="supplierForm"
          :rules="rules"
          ref="supplierFormRef"
          label-width="100px"
        >
          <el-form-item label="供应商名称" prop="name">
            <el-input v-model="supplierForm.name" placeholder="请输入供应商名称" />
          </el-form-item>
          
          <el-form-item label="供应商类型" prop="type">
            <el-select v-model="supplierForm.type" placeholder="请选择供应商类型" style="width: 100%">
              <el-option label="普通供应商" :value="0" />
              <el-option label="红事供应商" :value="1" />
              <el-option label="白事供应商" :value="2" />
              <el-option label="生鲜供应商" :value="3" />
              <el-option label="其他类型" :value="9" />
            </el-select>
          </el-form-item>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="联系人" prop="contactPerson">
                <el-input v-model="supplierForm.contactPerson" placeholder="请输入联系人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="supplierForm.phone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="supplierForm.address" placeholder="请输入详细地址" />
          </el-form-item>
          
          <el-form-item label="电子邮箱" prop="email">
            <el-input v-model="supplierForm.email" placeholder="请输入电子邮箱" />
          </el-form-item>
          
          <el-form-item label="状态">
            <el-switch
              v-model="supplierForm.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
          
          <el-form-item label="备注" prop="remark">
            <el-input 
              v-model="supplierForm.remark" 
              type="textarea" 
              placeholder="请输入备注信息" 
              rows="3" 
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitSupplierForm" :loading="submitLoading">确定</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 供应商详情对话框 -->
      <el-dialog
        v-model="detailVisible"
        title="供应商详情"
        width="700px"
      >
        <div class="supplier-detail" v-if="currentSupplier">
          <div class="supplier-detail-item">
            <span class="supplier-detail-label">供应商名称：</span>
            <span class="supplier-detail-value">{{ currentSupplier.name }}</span>
          </div>
          
          <div class="supplier-detail-item">
            <span class="supplier-detail-label">供应商类型：</span>
            <span class="supplier-detail-value">
              <el-tag 
                :type="getSupplierTagType(currentSupplier.type)"
                effect="plain"
              >
                {{ getSupplierTypeText(currentSupplier.type) }}
              </el-tag>
            </span>
          </div>
          
          <div class="supplier-detail-item">
            <span class="supplier-detail-label">联系人：</span>
            <span class="supplier-detail-value">{{ currentSupplier.contactPerson }}</span>
          </div>
          
          <div class="supplier-detail-item">
            <span class="supplier-detail-label">联系电话：</span>
            <span class="supplier-detail-value">{{ currentSupplier.phone }}</span>
          </div>
          
          <div class="supplier-detail-item">
            <span class="supplier-detail-label">电子邮箱：</span>
            <span class="supplier-detail-value">{{ currentSupplier.email || '暂无' }}</span>
          </div>
          
          <div class="supplier-detail-item">
            <span class="supplier-detail-label">详细地址：</span>
            <span class="supplier-detail-value">{{ currentSupplier.address }}</span>
          </div>
          
          <div class="supplier-detail-item">
            <span class="supplier-detail-label">创建时间：</span>
            <span class="supplier-detail-value">{{ currentSupplier.createTime }}</span>
          </div>
          
          <div class="supplier-detail-item">
            <span class="supplier-detail-label">状态：</span>
            <span class="supplier-detail-value">
              <el-tag :type="currentSupplier.status === 1 ? 'success' : 'info'">
                {{ currentSupplier.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </span>
          </div>
          
          <div class="supplier-detail-item full-width">
            <span class="supplier-detail-label">备注：</span>
            <span class="supplier-detail-value">{{ currentSupplier.remark || '暂无备注' }}</span>
          </div>
          
          <el-divider content-position="center">供应商商品</el-divider>
          
          <el-table :data="currentSupplier.products || []" border style="width: 100%">
            <el-table-column prop="name" label="商品名称" min-width="150" />
            <el-table-column prop="price" label="供应价" width="100">
              <template #default="scope">
                ¥{{ scope.row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="unit" label="单位" width="80" />
          </el-table>
        </div>
      </el-dialog>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/AdminLayout.vue'
import api from '@/api'

// 数据加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  type: ''
})

// 分页设置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 供应商列表
const supplierList = ref([])

// 当前选中的供应商
const currentSupplier = ref(null)

// 表单相关
const supplierFormRef = ref(null)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)

// 供应商表单数据
const supplierForm = reactive({
  id: null,
  name: '',
  type: 0,
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  status: 1,
  remark: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

// 初始化
onMounted(() => {
  loadSupplierList()
})

// 加载供应商列表
const loadSupplierList = async () => {
  loading.value = true
  try {
    // 实际项目中应调用API获取数据
    // const params = {
    //   ...searchForm,
    //   page: pagination.currentPage,
    //   pageSize: pagination.pageSize
    // }
    // const res = await api.product.getSupplierList(params)
    // supplierList.value = res.data.list || []
    // pagination.total = res.data.total || 0
    
    // 模拟数据
    setTimeout(() => {
      supplierList.value = [
        {
          id: 1,
          name: '喜宴酒席供应商',
          type: 1,
          contactPerson: '张三',
          phone: '13812345678',
          email: 'zhangsan@example.com',
          address: '江苏省南京市鼓楼区中山北路123号',
          status: 1,
          createTime: '2023-11-01 10:30:00',
          remark: '主要供应各类喜宴用品和场地服务',
          products: [
            { name: '婚宴餐具套装', price: 380, category: '红事商品', unit: '套' },
            { name: '婚庆场地布置', price: 1200, category: '红事商品', unit: '次' }
          ]
        },
        {
          id: 2,
          name: '丧葬用品供应商',
          type: 2,
          contactPerson: '李四',
          phone: '13987654321',
          email: 'lisi@example.com',
          address: '江苏省南京市玄武区玄武湖路456号',
          status: 1,
          createTime: '2023-11-02 14:20:00',
          remark: '提供各类丧葬用品和殡葬服务',
          products: [
            { name: '寿衣-棉麻款', price: 980, category: '白事商品', unit: '套' },
            { name: '花圈-标准款', price: 180, category: '白事商品', unit: '个' }
          ]
        },
        {
          id: 3,
          name: '水果生鲜供应基地',
          type: 3,
          contactPerson: '王五',
          phone: '13765432198',
          email: 'wangwu@example.com',
          address: '江苏省南京市江宁区秣陵街道789号',
          status: 1,
          createTime: '2023-11-03 09:15:00',
          remark: '各类新鲜水果直供，保证新鲜',
          products: [
            { name: '精品苹果礼盒', price: 138, category: '生鲜水果', unit: '箱' },
            { name: '进口香蕉', price: 45, category: '生鲜水果', unit: '箱' }
          ]
        }
      ]
      pagination.total = 3
      loading.value = false
    }, 600)
  } catch (error) {
    console.error('获取供应商列表失败：', error)
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadSupplierList()
}

// 重置搜索表单
const resetSearchForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 新增供应商
const handleAddSupplier = () => {
  resetSupplierForm()
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑供应商
const handleEditSupplier = (row) => {
  resetSupplierForm()
  isEdit.value = true
  Object.assign(supplierForm, row)
  dialogVisible.value = true
}

// 查看供应商详情
const handleViewSupplier = (row) => {
  currentSupplier.value = row
  detailVisible.value = true
}

// 删除供应商
const handleDeleteSupplier = async (row) => {
  try {
    // 实际项目中应调用API删除数据
    // await api.product.deleteSupplier(row.id)
    
    // 模拟删除成功
    ElMessage.success('删除成功')
    loadSupplierList()
  } catch (error) {
    console.error('删除供应商失败：', error)
    ElMessage.error('删除失败')
  }
}

// 修改供应商状态
const handleStatusChange = async (row, value) => {
  try {
    // 实际项目中应调用API更新状态
    // await api.product.updateSupplier(row.id, { status: value })
    
    // 模拟更新成功
    ElMessage.success(`已${value === 1 ? '启用' : '禁用'}`)
  } catch (error) {
    // 恢复原状态
    row.status = value === 1 ? 0 : 1
    console.error('更新状态失败：', error)
    ElMessage.error('操作失败')
  }
}

// 提交供应商表单
const submitSupplierForm = async () => {
  let valid = false
  try {
    valid = await supplierFormRef.value.validate()
  } catch (error) {
    valid = false
  }
  
  if (valid) {
    submitLoading.value = true
    
    try {
      if (isEdit.value) {
        // 编辑供应商
        // 实际项目中应调用API更新数据
        // await api.product.updateSupplier(supplierForm.id, supplierForm)
      } else {
        // 新增供应商
        // 实际项目中应调用API新增数据
        // await api.product.addSupplier(supplierForm)
      }
      
      // 模拟操作成功
      setTimeout(() => {
        ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
        dialogVisible.value = false
        loadSupplierList()
        submitLoading.value = false
      }, 600)
    } catch (error) {
      console.error('保存供应商失败：', error)
      ElMessage.error('保存失败')
      submitLoading.value = false
    }
  }
}

// 重置表单
const resetSupplierForm = () => {
  if (supplierFormRef.value) {
    supplierFormRef.value.resetFields()
  }
  
  Object.assign(supplierForm, {
    id: null,
    name: '',
    type: 0,
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 1,
    remark: ''
  })
}

// 分页大小变更
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadSupplierList()
}

// 页码变更
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadSupplierList()
}

// 获取供应商类型标签样式
const getSupplierTagType = (type) => {
  const typeMap = {
    0: '',
    1: 'danger',  // 红事
    2: 'info',    // 白事
    3: 'success', // 生鲜
    9: 'warning'  // 其他
  }
  return typeMap[type] || ''
}

// 获取供应商类型文本
const getSupplierTypeText = (type) => {
  const typeMap = {
    0: '普通供应商',
    1: '红事供应商',
    2: '白事供应商',
    3: '生鲜供应商',
    9: '其他类型'
  }
  return typeMap[type] || '未知'
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.supplier-detail {
  padding: 10px;
  
  .supplier-detail-item {
    margin-bottom: 15px;
    display: flex;
    
    &.full-width {
      flex-direction: column;
      
      .supplier-detail-value {
        margin-top: 5px;
        line-height: 1.5;
      }
    }
    
    .supplier-detail-label {
      width: 100px;
      color: var(--text-secondary);
      text-align: right;
      padding-right: 10px;
    }
    
    .supplier-detail-value {
      flex: 1;
    }
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>