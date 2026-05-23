const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true//** لحتى ما يتخزن فواصل بين الاسماء متل ما عملنا ب البروداكت*/
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6 ,      //** لحتى ما يكون في كلمة سر قصيره جدا  */
      match: [///لوضع قواعد قوية لكلمة المرور، مثل وجود حرف كبير، حرف صغير، رقم ورمز خاص
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
            'كلمة المرور ضعيفة جداً!'
              ]  
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  { timestamps: true }
);
userSchema.pre('save', async function () {//**(hashing) قبل ما يتم حفظ اليوزر في قاعدة البيانات، راح يتم تنفيذ هذا الكود */

  // إذا الباسورد ما تغير، لا تعيد تشفيره
  if (!this.isModified('password')) {
    return;
  }

  // توليد Salt
  const salt = await bcrypt.genSalt(10);

  // تشفير الباسورد
  this.password = await bcrypt.hash(this.password, salt);

});
userSchema.methods.comparePassword = async function (enteredPassword) {//**(compare method) هاي الميثود راح تستخدم لمقارنة الباسورد اللي دخلها المستخدم مع الباسورد المشفر في قاعدة البيانات */
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', userSchema);