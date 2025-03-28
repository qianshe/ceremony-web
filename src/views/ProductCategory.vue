<template>
  <admin-layout>
    <div class="category-container">
      <div class="page-header">
        <h2 class="chinese-title">商品分类管理</h2>
        <el-button 
          type="primary" 
          class="traditional-btn" 
          @click="handleAddCategory"
        >
          <el-icon><el-icon-plus /></el-icon> 新增分类
        </el-button>
      </div>
      
      <!-- 分类列表 -->
      <div class="traditional-card">
        <el-table
          :data="categoryList"
          style="width: 100%"
          row-key="id"
          border
          v-loading="loading"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column prop="name" label="分类名称" min-width="200">
            <template #default="scope">
              <span v-if="scope.row.level === 1" style="font-weight: bold">{{ scope.row.name }}</span>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="code" label="分类编码" width="150" />
          
          <el-table-column prop="sort" label="排序" width="100" align="center" />
          
          <el-table-column prop="productCount" label="商品数量" width="100" align="center" />
          
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="250" align="center" fixed="right">
            <template #default="scope">
              <el-button 
                link 
                type="primary" 
                size="small" 
                @click="handleEditCategory(scope.row)"
              >
                编辑
              </el-button>
              
              <el-button 
                link 
                type="success" 
                size="small" 
                v-if="scope.row.level === 1"
                @click="handleAddSubCategory(scope.row)"
              >
                添加子分类
              </el-button>
              
              <el-button 
                link 
                :type="scope.row.status === 1 ? 'warning' : 'success'" 
                size="small" 
                @click="handleToggleStatus(scope.row)"
              >
                {{ scope.row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              
              <el-popconfirm
                title="确定删除此分类吗?"
                @confirm="handleDeleteCategory(scope.row)"
                v-if="!(scope.row.children && scope.row.children.length) && scope.row.productCount === 0"
              >
                <template #reference>
                  <el-button 
                    link 
                    type="danger" 
                    size="small"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <!-- 分类表单对话框 -->
    <el-dialog
      :title="isEdit ? (isSubCategory ? '添加子分类' : '编辑分类') : '新增分类'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        :model="categoryForm"
        :rules="categoryRules"
        ref="categoryFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类编码" />
        </el-form-item>
        
        <el-form-item label="上级分类" prop="parentId" v-if="!isSubCategory">
          <el-select v-model="categoryForm.parentId" placeholder="请选择上级分类" style="width: 100%">
            <el-option :value="0" label="无 (作为一级分类)" />
            <el-option
              v-for="item in parentOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分类类型" prop="type">
          <el-select v-model="categoryForm.type" placeholder="请选择分类类型" style="width: 100%">
            <el-option label="通用商品" :value="0" />
            <el-option label="红事商品" :value="1" />
            <el-option label="白事商品" :value="2" />
            <el-option label="生鲜商品" :value="3" />
            <el-option label="其他商品" :value="9" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" style="width: 120px" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="categoryForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <el-form-item label="图标" prop="icon">
          <div class="icon-selector">
            <el-input v-model="categoryForm.icon" placeholder="请选择图标或输入图标名称">
              <template #append>
                <el-popover
                  placement="bottom"
                  :width="400"
                  trigger="click"
                >
                  <template #reference>
                    <el-button>选择</el-button>
                  </template>
                  <div class="icon-list">
                    <div 
                      v-for="icon in commonIcons" 
                      :key="icon" 
                      class="icon-item"
                      @click="selectIcon(icon)"
                    >
                      <el-icon>
                        <component :is="`el-icon-${icon}`"></component>
                      </el-icon>
                      <span class="icon-name">{{ icon }}</span>
                    </div>
                  </div>
                </el-popover>
              </template>
            </el-input>
            <div class="icon-preview" v-if="categoryForm.icon">
              <el-icon size="20">
                <component :is="`el-icon-${categoryForm.icon}`"></component>
              </el-icon>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            placeholder="请输入分类描述"
            rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '../components/AdminLayout.vue'
import api from '../api'

// 数据加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 分类列表
const categoryList = ref([])

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const isSubCategory = ref(false)

// 表单相关
const categoryFormRef = ref(null)

// 分类表单数据
const categoryForm = reactive({
  id: null,
  parentId: 0,
  name: '',
  code: '',
  icon: '',
  type: 0,
  sort: 0,
  status: 1,
  description: ''
})

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入分类编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择分类类型', trigger: 'change' }
  ]
}

// 父级分类选项
const parentOptions = ref([])

// 常用图标
const commonIcons = [
  'goods', 'present', 'box', 'shopping-bag', 'shopping-cart',
  'cherry', 'apple', 'orange', 'coffee-cup', 'food',
  'fork-spoon', 'tableware', 'knife-fork', 'dish', 'chicken',
  'dessert', 'ice-cream', 'hot-water', 'milk-tea', 'grape',
  'cold-drink', 'goblet', 'goblet-full', 'goblet-square-full', 'lollipop',
  'bangzhu', 'house', 'menu', 'star', 'star-off',
  'user', 'phone', 'picture', 'camera', 'video-camera',
  'calendar', 'document', 'folder', 'folder-opened', 'coin'
]

// 初始化
onMounted(() => {
  loadCategoryList()
})

// 加载分类列表
const loadCategoryList = async () => {
  loading.value = true
  try {
    // 实际项目中应调用API获取数据
    // const res = await api.product.getCategoryList()
    // categoryList.value = res.data || []
    
    // 模拟数据
    setTimeout(() => {
      categoryList.value = [
        {
          id: 1,
          parentId: 0,
          name: '红事商品',
          code: 'happy',
          icon: 'present',
          type: 1,
          sort: 1,
          status: 1,
          productCount: 28,
          level: 1,
          description: '婚庆、满月等喜庆场合使用的商品',
          children: [
            {
              id: 4,
              parentId: 1,
              name: '婚礼用品',
              code: 'wedding',
              icon: 'goblet',
              type: 1,
              sort: 1,
              status: 1,
              productCount: 18,
              level: 2,
              description: '婚礼庆典使用的各类用品'
            },
            {
              id: 5,
              parentId: 1,
              name: '满月用品',
              code: 'fullmoon',
              icon: 'lollipop',
              type: 1,
              sort: 2,
              status: 1,
              productCount: 10,
              level: 2,
              description: '满月酒席使用的各类用品'
            }
          ]
        },
        {
          id: 2,
          parentId: 0,
          name: '白事商品',
          code: 'memorial',
          icon: 'bangzhu',
          type: 2,
          sort: 2,
          status: 1,
          productCount: 20,
          level: 1,
          description: '丧葬仪式等场合使用的商品',
          children: [
            {
              id: 6,
              parentId: 2,
              name: '殡葬用品',
              code: 'funeral',
              icon: 'folder',
              type: 2,
              sort: 1,
              status: 1,
              productCount: 12,
              level: 2,
              description: '传统丧葬仪式使用的各类用品'
            },
            {
              id: 7,
              parentId: 2,
              name: '祭祀用品',
              code: 'worship',
              icon: 'menu',
              type: 2,
              sort: 2,
              status: 1,
              productCount: 8,
              level: 2,
              description: '祭祀仪式使用的各类用品'
            }
          ]
        },
        {
          id: 3,
          parentId: 0,
          name: '生鲜商品',
          code: 'fresh',
          icon: 'cherry',
          type: 3,
          sort: 3,
          status: 1,
          productCount: 15,
          level: 1,
          description: '各类新鲜水果、蔬菜等生鲜商品',
          children: [
            {
              id: 8,
              parentId: 3,
              name: '水果',
              code: 'fruit',
              icon: 'apple',
              type: 3,
              sort: 1,
              status: 1,
              productCount: 8,
              level: 2,
              description: '各类新鲜水果'
            },
            {
              id: 9,
              parentId: 3,
              name: '蔬菜',
              code: 'vegetable',
              icon: 'food',
              type: 3,
              sort: 2,
              status: 1,
              productCount: 7,
              level: 2,
              description: '各类新鲜蔬菜'
            }
          ]
        }
      ]
      
      // 更新父级分类选项
      updateParentOptions()
      
      loading.value = false
    }, 600)
  } catch (error) {
    console.error('获取分类列表失败：', error)
    loading.value = false
  }
}

// 更新父级分类选项
const updateParentOptions = () => {
  parentOptions.value = categoryList.value
    .filter(item => item.level === 1)
    .map(item => ({
      id: item.id,
      name: item.name
    }))
}

// 新增分类
const handleAddCategory = () => {
  resetCategoryForm()
  isEdit.value = false
  isSubCategory.value = false
  dialogVisible.value = true
}

// 添加子分类
const handleAddSubCategory = (parentCategory) => {
  resetCategoryForm()
  isEdit.value = true
  isSubCategory.value = true
  categoryForm.parentId = parentCategory.id
  categoryForm.type = parentCategory.type
  dialogVisible.value = true
}

// 编辑分类
const handleEditCategory = (category) => {
  resetCategoryForm()
  isEdit.value = true
  isSubCategory.value = false
  
  Object.assign(categoryForm, {
    id: category.id,
    parentId: category.parentId,
    name: category.name,
    code: category.code,
    icon: category.icon,
    type: category.type,
    sort: category.sort,
    status: category.status,
    description: category.description
  })
  
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = (category) => {
  const newStatus = category.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'
  
  ElMessageBox.confirm(`确定要${statusText}【${category.name}】分类吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 实际项目中应调用API更新状态
    // await api.product.updateCategory(category.id, { status: newStatus })
    
    // 模拟更新成功
    category.status = newStatus
    ElMessage.success(`${statusText}成功`)
  }).catch(() => {})
}

// 删除分类
const handleDeleteCategory = async (category) => {
  try {
    // 实际项目中应调用API删除分类
    // await api.product.deleteCategory(category.id)
    
    // 模拟删除
    // 查找并删除
    const removeCategory = (list, id) => {
      const index = list.findIndex(item => item.id === id)
      if (index !== -1) {
        list.splice(index, 1)
        return true
      }
      
      // 递归查找子分类
      for (const item of list) {
        if (item.children && item.children.length) {
          if (removeCategory(item.children, id)) {
            return true
          }
        }
      }
      
      return false
    }
    
    removeCategory(categoryList.value, category.id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除分类失败：', error)
    ElMessage.error('删除失败')
  }
}

// 提交分类表单
const submitCategoryForm = async () => {
  let valid = false
  try {
    valid = await categoryFormRef.value.validate()
  } catch (error) {
    valid = false
  }
  
  if (valid) {
    submitLoading.value = true
    
    try {
      // 实际项目中应调用API保存数据
      // if (isEdit.value) {
      //   await api.product.updateCategory(categoryForm.id, categoryForm)
      // } else {
      //   await api.product.addCategory(categoryForm)
      // }
      
      // 模拟保存成功
      setTimeout(() => {
        // 刷新分类列表
        loadCategoryList()
        
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        dialogVisible.value = false
        submitLoading.value = false
      }, 600)
    } catch (error) {
      console.error('保存分类失败：', error)
      ElMessage.error('保存失败')
      submitLoading.value = false
    }
  }
}

// 重置分类表单
const resetCategoryForm = () => {
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields()
  }
  
  Object.assign(categoryForm, {
    id: null,
    parentId: 0,
    name: '',
    code: '',
    icon: '',
    type: 0,
    sort: 0,
    status: 1,
    description: ''
  })
}

// 选择图标
const selectIcon = (icon) => {
  categoryForm.icon = icon
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.icon-selector {
  display: flex;
  align-items: center;
  
  .icon-preview {
    margin-left: 15px;
    padding: 5px 10px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
  }
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  
  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    .el-icon {
      font-size: 20px;
      margin-bottom: 5px;
    }
    
    .icon-name {
      font-size: 12px;
      color: #606266;
    }
  }
}
</style> 