# 🗄️ Database Scripts Index

All SQL scripts for database setup, migrations, and fixes.

---

## 🚀 Getting Started

### **New Project Setup**
Run this FIRST for a fresh database:

**[FRESH-START-COMPLETE.sql](FRESH-START-COMPLETE.sql)**
- Complete database schema
- All tables (users, profiles, games, match_history)
- Row-level security policies
- Indexes and triggers
- **Run this before anything else!**

---

## 🔧 Feature Setup Scripts

### **Avatar System**
**[SUPABASE-AVATAR-SETUP.sql](SUPABASE-AVATAR-SETUP.sql)**
- Creates avatars storage bucket
- Sets up upload policies
- Configures public access
- Adds avatar_url column
- **Run after profile system is set up**

---

## 🐛 Fix Scripts

### **API Errors**
**[FINAL-406-FIX.sql](FINAL-406-FIX.sql)**
- Fixes 406 Not Acceptable errors
- Updates API URL handling
- Configures proper MIME types
- **Use if getting 406 errors**

**[PERMANENT-FIX.sql](PERMANENT-FIX.sql)**
- General database fixes
- Policy updates
- Schema corrections
- **Comprehensive fix for common issues**

---

## 🔍 Diagnostic Scripts

### **Database Health Check**
**[DIAGNOSE.sql](DIAGNOSE.sql)**
- Checks table existence
- Verifies policies
- Tests permissions
- Shows current schema
- **Run to debug database issues**

### **Setup Verification**
**[VERIFY-SETUP.sql](VERIFY-SETUP.sql)**
- Verifies complete setup
- Checks all tables exist
- Confirms policies are active
- Tests data insertion
- **Run after setup to confirm everything works**

---

## 📋 Script Execution Order

### **For New Projects:**
```sql
1. FRESH-START-COMPLETE.sql      -- Complete setup
2. SUPABASE-AVATAR-SETUP.sql     -- Avatar system
3. VERIFY-SETUP.sql              -- Check everything
```

### **For Existing Projects:**
```sql
1. DIAGNOSE.sql                  -- Check current state
2. [Fix script if needed]        -- Apply fixes
3. VERIFY-SETUP.sql              -- Verify fixes
```

### **For Troubleshooting:**
```sql
1. DIAGNOSE.sql                  -- Identify issues
2. PERMANENT-FIX.sql             -- Apply general fixes
3. [Specific fix if needed]      -- Target specific problems
4. VERIFY-SETUP.sql              -- Confirm resolution
```

---

## 📊 Script Details

### **FRESH-START-COMPLETE.sql** (10 KB)
**Purpose:** Complete database initialization
**Creates:**
- `users` table
- `profiles` table
- `games` table
- `match_history` table
- All RLS policies
- Indexes and triggers

**When to use:**
- ✅ New project
- ✅ Clean slate needed
- ✅ Major schema changes
- ❌ Existing data (will drop tables!)

---

### **SUPABASE-AVATAR-SETUP.sql** (1.6 KB)
**Purpose:** Avatar upload system
**Creates:**
- `avatars` storage bucket
- Upload policies (authenticated users)
- Public read access
- `avatar_url` column

**When to use:**
- ✅ After profile system setup
- ✅ When avatar upload fails
- ✅ When images don't display
- ✅ RLS policy errors

---

### **FINAL-406-FIX.sql** (3 KB)
**Purpose:** Fix 406 Not Acceptable errors
**Fixes:**
- API endpoint configurations
- MIME type handling
- Content negotiation
- Response formatting

**When to use:**
- ✅ Getting 406 errors
- ✅ API responses failing
- ✅ Content-type mismatches

---

### **PERMANENT-FIX.sql** (3.6 KB)
**Purpose:** General database corrections
**Fixes:**
- Common policy issues
- Schema inconsistencies
- Permission problems
- Index optimization

**When to use:**
- ✅ Multiple small issues
- ✅ After major updates
- ✅ Permission errors
- ✅ General cleanup

---

### **DIAGNOSE.sql** (3 KB)
**Purpose:** Database health check
**Shows:**
- All tables and columns
- Active policies
- Current permissions
- Schema structure
- Issue detection

**When to use:**
- ✅ Before any fixes
- ✅ Debugging issues
- ✅ Verifying setup
- ✅ Understanding current state

---

### **VERIFY-SETUP.sql** (4.2 KB)
**Purpose:** Setup verification
**Tests:**
- Table existence
- Policy functionality
- Data insertion
- Query permissions
- Complete setup validation

**When to use:**
- ✅ After running setup scripts
- ✅ After applying fixes
- ✅ Before deployment
- ✅ Regular health checks

---

## 🎯 Common Scenarios

### **"Starting a new project"**
```sql
→ FRESH-START-COMPLETE.sql
→ SUPABASE-AVATAR-SETUP.sql
→ VERIFY-SETUP.sql
```

### **"Avatar upload not working"**
```sql
→ DIAGNOSE.sql (check current state)
→ SUPABASE-AVATAR-SETUP.sql
→ VERIFY-SETUP.sql
```

### **"Getting database errors"**
```sql
→ DIAGNOSE.sql (identify problem)
→ PERMANENT-FIX.sql (general fixes)
→ [Specific fix if needed]
→ VERIFY-SETUP.sql
```

### **"406 API errors"**
```sql
→ FINAL-406-FIX.sql
→ VERIFY-SETUP.sql
```

### **"Want to check everything"**
```sql
→ DIAGNOSE.sql (see current state)
→ VERIFY-SETUP.sql (test functionality)
```

---

## 💡 Best Practices

### **Before Running Scripts:**
1. ✅ Backup existing data
2. ✅ Read script comments
3. ✅ Understand what it does
4. ✅ Check if appropriate for your case

### **When Running Scripts:**
1. ✅ Run in Supabase SQL Editor
2. ✅ One script at a time
3. ✅ Check for errors after each
4. ✅ Verify results before proceeding

### **After Running Scripts:**
1. ✅ Run VERIFY-SETUP.sql
2. ✅ Check application functionality
3. ✅ Test affected features
4. ✅ Monitor for issues

---

## 🆘 Troubleshooting

### **Script Errors:**
```
1. Check syntax carefully
2. Ensure proper permissions
3. Verify table names match
4. Check if tables already exist
```

### **Policy Errors:**
```
1. Run DIAGNOSE.sql first
2. Drop conflicting policies
3. Re-run setup scripts
4. Verify with VERIFY-SETUP.sql
```

### **Permission Errors:**
```
1. Check user roles
2. Verify RLS is enabled
3. Review policy conditions
4. Test with VERIFY-SETUP.sql
```

---

## 📊 Database Stats

- **Total Scripts:** 6
- **Setup Scripts:** 2
- **Fix Scripts:** 2
- **Diagnostic Scripts:** 2
- **Total Size:** ~25 KB

---

## 🔗 Related Documentation

For more information, check:
- `/docs/SETUP.md` - Initial setup guide
- `/docs/TROUBLESHOOTING-NOW.md` - Common issues
- `/docs/AVATAR-UPLOAD-FIX.md` - Avatar setup help
- `/docs/ERROR-FIXES-COMPLETE.md` - Error solutions

---

**All database scripts organized and documented!** ✨

*Run scripts in Supabase SQL Editor for best results.*
