import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, supabaseConfigured } from './supabase';

const C = { n:'#111936', p:'#6D4AFF', bg:'#F5F6FB', t:'#18213A', m:'#77809A', g:'#20B76B', o:'#F59E0B', r:'#E55353', w:'#FFFFFF' };

function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!supabaseConfigured) return Alert.alert('إعداد مطلوب','أضف بيانات Supabase إلى متغيرات البيئة EXPO_PUBLIC_SUPABASE_URL و EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    if (!email.trim() || password.length < 6) return Alert.alert('بيانات غير صحيحة','اكتب بريدًا صحيحًا وكلمة مرور من 6 أحرف على الأقل.');
    setBusy(true);
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email:email.trim(), password, options:{ data:{ full_name:name.trim() || 'طالب' } } })
      : await supabase.auth.signInWithPassword({ email:email.trim(), password });
    setBusy(false);
    if (result.error) return Alert.alert('خطأ', result.error.message);
    if (mode === 'signup' && !result.data.session) Alert.alert('تم إنشاء الحساب','راجع بريدك الإلكتروني إذا كان تأكيد البريد مفعّلًا.');
  };

  return <SafeAreaView style={s.auth}>
    <ScrollView contentContainerStyle={s.authInner} keyboardShouldPersistTaps="handled">
      <Text style={s.logo}>🎓</Text>
      <Text style={s.at}>رحلة الثانوية</Text>
      <Text style={s.as}>ذاكر بذكاء، وتقدم خطوة كل يوم</Text>
      {mode === 'signup' && <TextInput style={s.in} placeholder="الاسم" value={name} onChangeText={setName} />}
      <TextInput style={s.in} placeholder="البريد الإلكتروني" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.in} placeholder="كلمة المرور" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <><Ionicons name={mode==='login'?'log-in-outline':'person-add-outline'} size={21} color="#fff" /><Text style={s.bt}>{mode==='login'?'تسجيل الدخول':'إنشاء حساب'}</Text></>}
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>setMode(mode==='login'?'signup':'login')}><Text style={s.sw}>{mode==='login'?'ليس لديك حساب؟ إنشاء حساب':'لديك حساب؟ تسجيل الدخول'}</Text></TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}

function Home({ profile, mins, run, sec, setRun, save, subjects }) {
  const hours = Math.floor(mins/60);
  const goal = profile?.daily_goal_minutes || 180;
  const progress = Math.min(100, Math.round((mins/goal)*100));
  return <ScrollView contentContainerStyle={s.content}>
    <View style={s.top}><Text style={s.brand}>رحلة الثانوية</Text><Text style={s.w}>مرحبًا {profile?.full_name || 'طالب'} 👋</Text></View>
    <View style={s.card}><Text style={s.lab}>إجمالي المذاكرة المسجل</Text><Text style={s.big}>{hours} ساعة {mins%60} دقيقة</Text><View style={s.progress}><View style={[s.progressFill,{width:`${progress}%`}]} /></View><Text style={s.muted}>هدفك اليوم {goal} دقيقة • إنجازك {progress}%</Text></View>
    <View style={s.row}><View style={s.stat}><Text>⭐ النقاط</Text><Text style={s.val}>{profile?.points || 0}</Text></View><View style={s.stat}><Text>🔥 السلسلة</Text><Text style={s.val}>{profile?.streak || 0} أيام</Text></View></View>
    <View style={s.timer}><Text style={s.time}>{String(Math.floor(sec/60)).padStart(2,'0')}:{String(sec%60).padStart(2,'0')}</Text><Text style={s.timerLabel}>جلسة تركيز</Text></View>
    <TouchableOpacity style={s.btn} onPress={()=>setRun(!run)}><Ionicons name={run?'pause':'play'} size={22} color="#fff"/><Text style={s.bt}>{run?'إيقاف مؤقت':'ابدأ المذاكرة'}</Text></TouchableOpacity>
    <TouchableOpacity style={s.save} onPress={save}><Text style={s.savet}>إنهاء وحفظ الجلسة</Text></TouchableOpacity>
    <Text style={s.sectionTitle}>موادك الدراسية</Text>
    <View style={s.subjectWrap}>{subjects.map(x=><View key={x.id} style={s.subject}><Text style={s.subjectDot}>●</Text><Text style={s.subjectText}>{x.name}</Text></View>)}</View>
  </ScrollView>;
}

function Quiz({ userId }) {
  const [quizzes,setQuizzes]=useState([]); const [selected,setSelected]=useState(null); const [questions,setQuestions]=useState([]); const [answers,setAnswers]=useState({}); const [done,setDone]=useState(false); const [score,setScore]=useState(0); const [loading,setLoading]=useState(true);
  useEffect(()=>{supabase.from('quizzes').select('id,title,subject_id,subjects(name)').order('id').then(({data,error})=>{if(!error)setQuizzes(data||[]);setLoading(false);});},[]);
  const start=async(q)=>{setLoading(true);setSelected(q);setDone(false);setAnswers({});const {data,error}=await supabase.from('quiz_questions').select('*').eq('quiz_id',q.id).order('id');setLoading(false);if(error)return Alert.alert('خطأ',error.message);setQuestions(data||[]);};
  const finish=async()=>{let sc=0;questions.forEach(q=>{if(Number(answers[q.id])===q.correct_index)sc++;});setScore(sc);setDone(true);const {error}=await supabase.from('quiz_attempts').insert({user_id:userId,quiz_id:selected.id,score:sc,total:questions.length});if(error)Alert.alert('تنبيه','تم إنهاء الاختبار لكن تعذر حفظ النتيجة.');};
  if(loading)return <View style={s.center}><ActivityIndicator color={C.p}/></View>;
  if(!selected)return <ScrollView contentContainerStyle={s.content}><Text style={s.pageTitle}>🧠 الاختبارات</Text>{quizzes.length===0?<Text style={s.empty}>لا توجد اختبارات حاليًا.</Text>:quizzes.map(q=><TouchableOpacity key={q.id} style={s.quizCard} onPress={()=>start(q)}><Text style={s.quizTitle}>{q.title}</Text><Text style={s.muted}>{q.subjects?.name || 'مادة عامة'}</Text></TouchableOpacity>)}</ScrollView>;
  if(done)return <View style={s.center}><Text style={s.resultIcon}>🏆</Text><Text style={s.pageTitle}>نتيجتك {score} / {questions.length}</Text><TouchableOpacity style={s.btn} onPress={()=>setSelected(null)}><Text style={s.bt}>اختبار آخر</Text></TouchableOpacity></View>;
  return <ScrollView contentContainerStyle={s.content}><TouchableOpacity onPress={()=>setSelected(null)}><Text style={s.back}>← الاختبارات</Text></TouchableOpacity><Text style={s.pageTitle}>{selected.title}</Text>{questions.map((q,i)=><View key={q.id} style={s.question}><Text style={s.qText}>{i+1}. {q.question}</Text>{(q.options||[]).map((op,j)=><TouchableOpacity key={j} style={[s.option,Number(answers[q.id])===j&&s.optionSelected]} onPress={()=>setAnswers({...answers,[q.id]:j})}><Text style={s.optionText}>{op}</Text></TouchableOpacity>)}</View>)}<TouchableOpacity style={s.btn} onPress={finish}><Text style={s.bt}>إنهاء الاختبار</Text></TouchableOpacity></ScrollView>;
}

function Badges({ userId }) {
  const [badges,setBadges]=useState([]); const [earned,setEarned]=useState([]);
  useEffect(()=>{(async()=>{const b=await supabase.from('badges').select('*').order('id');const e=await supabase.from('user_badges').select('badge_id,earned_at').eq('user_id',userId);setBadges(b.data||[]);setEarned(e.data||[]);})();},[userId]);
  return <ScrollView contentContainerStyle={s.content}><Text style={s.pageTitle}>🏆 الشارات</Text><Text style={s.muted}>اجمع الإنجازات مع كل خطوة.</Text>{badges.map(b=>{const yes=earned.some(x=>x.badge_id===b.id);return <View key={b.id} style={[s.badge,yes&&s.badgeEarned]}><Text style={s.badgeIcon}>{b.icon}</Text><View style={{flex:1}}><Text style={s.badgeTitle}>{b.title}</Text><Text style={s.muted}>{b.description}</Text></View><Text>{yes?'✅':'🔒'}</Text></View>})}</ScrollView>;
}

function App() {
  const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[mins,setMins]=useState(0),[run,setRun]=useState(false),[sec,setSec]=useState(0),[subjects,setSubjects]=useState([]),[tab,setTab]=useState('home');
  useEffect(()=>{supabase.auth.getSession().then(({data})=>setSession(data.session));const {data:{subscription}}=supabase.auth.onAuthStateChange((_,z)=>setSession(z));return()=>subscription.unsubscribe();},[]);
  useEffect(()=>{if(!session)return;const load=async()=>{const [p,ss,sub]=await Promise.all([supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle(),supabase.from('study_sessions').select('duration_minutes').eq('user_id',session.user.id),supabase.from('subjects').select('*').order('id')]);setProfile(p.data);setMins((ss.data||[]).reduce((a,b)=>a+(b.duration_minutes||0),0));setSubjects(sub.data||[]);};load();},[session]);
  useEffect(()=>{if(!run)return;const t=setInterval(()=>setSec(v=>v+1),1000);return()=>clearInterval(t);},[run]);
  const save=async()=>{const d=Math.floor(sec/60);if(d<1)return Alert.alert('جلسة قصيرة','ذاكر دقيقة واحدة على الأقل ثم احفظ الجلسة.');const {error}=await supabase.from('study_sessions').insert({user_id:session.user.id,duration_minutes:d,ended_at:new Date().toISOString(),completed:true});if(error)return Alert.alert('خطأ',error.message);const newPoints=(profile?.points||0)+d;const {data:all}=await supabase.from('study_sessions').select('started_at').eq('user_id',session.user.id).order('started_at',{ascending:false});const days=[...new Set((all||[]).map(x=>new Date(x.started_at).toISOString().slice(0,10)))];let streak=0;let cursor=new Date();for(let i=0;i<days.length;i++){const day=cursor.toISOString().slice(0,10);if(days.includes(day)){streak++;cursor.setDate(cursor.getDate()-1);}else if(i===0){cursor.setDate(cursor.getDate()-1);if(days.includes(cursor.toISOString().slice(0,10))){streak++;cursor.setDate(cursor.getDate()-1);}else break;}else break;}await supabase.from('profiles').update({points:newPoints,streak}).eq('id',session.user.id);setProfile({...profile,points:newPoints,streak});setMins(mins+d);setSec(0);setRun(false);Alert.alert('أحسنت! 🎉','تم حفظ جلسة المذاكرة.');};
  if(!session)return <Auth/>;
  return <SafeAreaView style={s.app}><View style={{flex:1}}>{tab==='home'?<Home {...{profile,mins,run,sec,setRun,save,subjects}}/>:tab==='quiz'?<Quiz userId={session.user.id}/>:<Badges userId={session.user.id}/>}</View><View style={s.nav}><TouchableOpacity onPress={()=>setTab('home')}><Ionicons name="home" size={24} color={tab==='home'?C.p:C.m}/><Text style={s.navText}>الرئيسية</Text></TouchableOpacity><TouchableOpacity onPress={()=>setTab('quiz')}><Ionicons name="school" size={24} color={tab==='quiz'?C.p:C.m}/><Text style={s.navText}>اختبارات</Text></TouchableOpacity><TouchableOpacity onPress={()=>setTab('badges')}><Ionicons name="trophy" size={24} color={tab==='badges'?C.p:C.m}/><Text style={s.navText}>الشارات</Text></TouchableOpacity><TouchableOpacity onPress={()=>supabase.auth.signOut()}><Ionicons name="log-out-outline" size={24} color={C.r}/><Text style={s.navText}>خروج</Text></TouchableOpacity></View></SafeAreaView>;
}

const s=StyleSheet.create({app:{flex:1,backgroundColor:C.bg},content:{padding:18,paddingBottom:30},top:{backgroundColor:C.n,borderRadius:24,padding:20,marginBottom:14},brand:{color:'#fff',fontSize:28,fontWeight:'900',textAlign:'right'},w:{color:'#D9DEEF',textAlign:'right',marginTop:6},card:{backgroundColor:'#fff',borderRadius:20,padding:20},lab:{color:C.m,textAlign:'right'},big:{fontSize:29,fontWeight:'900',color:C.t,textAlign:'right',marginTop:5},muted:{color:C.m,textAlign:'center',marginTop:5},progress:{height:8,backgroundColor:'#E8EAF2',borderRadius:8,overflow:'hidden',marginTop:15},progressFill:{height:8,backgroundColor:C.g,borderRadius:8},row:{flexDirection:'row',gap:10,marginTop:12},stat:{flex:1,backgroundColor:'#fff',borderRadius:18,padding:17,alignItems:'center'},val:{fontSize:21,fontWeight:'900',color:C.p,marginTop:8},timer:{backgroundColor:C.n,width:220,height:220,borderRadius:110,alignSelf:'center',margin:20,alignItems:'center',justifyContent:'center'},time:{fontSize:48,fontWeight:'900',color:'#fff'},timerLabel:{color:'#D9DEEF',marginTop:5},btn:{backgroundColor:C.p,borderRadius:17,padding:16,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8},bt:{color:'#fff',fontSize:16,fontWeight:'900'},save:{padding:18,alignItems:'center'},savet:{color:C.g,fontWeight:'900'},sectionTitle:{fontSize:20,fontWeight:'900',color:C.t,textAlign:'right',marginTop:10,marginBottom:10},subjectWrap:{flexDirection:'row',flexWrap:'wrap',gap:8},subject:{backgroundColor:'#fff',borderRadius:14,padding:12,flexDirection:'row',gap:7},subjectDot:{color:C.p},subjectText:{fontWeight:'700',color:C.t},nav:{height:72,backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#E5E7EF',flexDirection:'row',justifyContent:'space-around',alignItems:'center'},navText:{fontSize:11,color:C.m,marginTop:3},pageTitle:{fontSize:26,fontWeight:'900',color:C.t,textAlign:'right',marginBottom:15},quizCard:{backgroundColor:'#fff',padding:18,borderRadius:18,marginBottom:10},quizTitle:{fontSize:18,fontWeight:'900',color:C.t,textAlign:'right'},question:{backgroundColor:'#fff',padding:16,borderRadius:18,marginBottom:12},qText:{fontSize:17,fontWeight:'800',color:C.t,textAlign:'right',lineHeight:25,marginBottom:10},option:{padding:13,borderRadius:12,borderWidth:1,borderColor:'#E1E4ED',marginTop:8},optionSelected:{borderColor:C.p,backgroundColor:'#F0ECFF'},optionText:{textAlign:'right',color:C.t},back:{color:C.p,fontWeight:'800',textAlign:'right',marginBottom:15},center:{flex:1,alignItems:'center',justifyContent:'center',padding:25},resultIcon:{fontSize:70},empty:{textAlign:'center',color:C.m,marginTop:30},badge:{backgroundColor:'#fff',borderRadius:18,padding:16,marginTop:10,flexDirection:'row',alignItems:'center',gap:12},badgeEarned:{borderWidth:1,borderColor:'#BCE8D2'},badgeIcon:{fontSize:34},badgeTitle:{fontSize:17,fontWeight:'900',color:C.t,textAlign:'right'},auth:{flex:1,backgroundColor:C.n},authInner:{flexGrow:1,padding:24,justifyContent:'center'},logo:{fontSize:60,textAlign:'center'},at:{fontSize:34,fontWeight:'900',color:'#fff',textAlign:'center',marginTop:10},as:{color:'#D9DEEF',textAlign:'center',marginBottom:25},in:{backgroundColor:'#fff',borderRadius:16,padding:15,marginBottom:10,textAlign:'right'},sw:{color:'#F6C945',textAlign:'center',marginTop:18,fontWeight:'800'}});

export default App;
