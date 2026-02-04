
import React, { useState, useEffect } from 'react';
import { getLiveLink, setLiveLink, getWebinarInfo, setWebinarInfo } from '../services/configService';
import { getStoredFirebaseConfig, fetchAllRegistrations } from '../services/firebaseService';
import { ADMIN_PASSWORD, STORAGE_KEY_FIREBASE_CONFIG } from '../constants';
import { FirebaseSettings, UserRegistration } from '../types';

interface AdminPageProps {
  onBack: () => void;
}

type TabType = 'url' | 'firebase' | 'list';

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('list');
  
  // Webinar Info
  const [url, setUrl] = useState('');
  const [topic, setTopic] = useState({ title: '', description: '', imageUrl: '', schedule: '', speaker: '' });
  
  // Firebase Config
  const [fbConfig, setFbConfig] = useState<FirebaseSettings>({
    apiKey: '', authDomain: '', projectId: '', storageBucket: '',
    messagingSenderId: '', appId: '', measurementId: ''
  });

  // Registrations Data
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  useEffect(() => {
    setUrl(getLiveLink());
    setTopic(getWebinarInfo());
    setFbConfig(getStoredFirebaseConfig());
    if (isAuthenticated) {
      loadRegistrations();
    }
  }, [isAuthenticated]);

  const loadRegistrations = async () => {
    setIsFetching(true);
    const data = await fetchAllRegistrations();
    setRegistrations(data);
    setIsFetching(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const toggleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...registrations].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return newOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
    setRegistrations(sorted);
  };

  const downloadCSV = () => {
    if (registrations.length === 0) return;
    const headers = ['소속', '사번', '성함', '직책', '참여시간'];
    const rows = registrations.map(r => [
      r.affiliation,
      r.employeeId,
      r.name,
      r.position,
      new Date(r.timestamp).toLocaleString('ko-KR')
    ]);
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NOW_Participant_List_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWebinarSave = () => {
    setSaveStatus('saving');
    setLiveLink(url);
    setWebinarInfo(topic.title, topic.description, topic.imageUrl, topic.schedule, topic.speaker);
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleFbSave = () => {
    setSaveStatus('saving');
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(fbConfig));
    setTimeout(() => {
      setSaveStatus('success');
      alert('Firebase 설정이 저장되었습니다. 페이지를 새로고침합니다.');
      window.location.reload();
    }, 500);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] pt-16">
        <div className="glass-effect p-8 rounded-2xl w-full max-w-sm border border-white/10 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">N</div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
              로그인
            </button>
            <button type="button" onClick={onBack} className="w-full text-slate-500 text-sm hover:text-white transition-colors">
              돌아가기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-24 pb-12">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
            Control Panel
          </h1>
          <p className="text-slate-500 text-xs mt-1 ml-5">GitHub Pages: finisher33.github.io/Landingpage/</p>
        </div>
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white text-sm flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          메인으로
        </button>
      </div>

      <div className="glass-effect rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="flex bg-slate-900/50 border-b border-white/5 overflow-x-auto">
          <button onClick={() => setActiveTab('list')} className={`flex-1 min-w-[120px] py-5 font-bold transition-all ${activeTab === 'list' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>참가자 명단</button>
          <button onClick={() => setActiveTab('url')} className={`flex-1 min-w-[120px] py-5 font-bold transition-all ${activeTab === 'url' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>콘텐츠 설정</button>
          <button onClick={() => setActiveTab('firebase')} className={`flex-1 min-w-[120px] py-5 font-bold transition-all ${activeTab === 'firebase' ? 'bg-white/5 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>시스템 연동</button>
        </div>

        <div className="p-8">
          {activeTab === 'list' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  참가 현황
                  <span className="ml-3 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">{registrations.length}명 등록</span>
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={loadRegistrations} className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">새로고침</button>
                  <button onClick={downloadCSV} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">CSV 다운로드</button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-slate-300 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">소속</th>
                      <th className="px-6 py-4">사번</th>
                      <th className="px-6 py-4">성함</th>
                      <th className="px-6 py-4">직책</th>
                      <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={toggleSort}>
                        참여 시간 {sortOrder === 'asc' ? '↑' : '↓'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">참가자 데이터가 없습니다.</td>
                      </tr>
                    ) : (
                      registrations.map((reg, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">{reg.affiliation}</td>
                          <td className="px-6 py-4">{reg.employeeId}</td>
                          <td className="px-6 py-4 text-white font-medium">{reg.name}</td>
                          <td className="px-6 py-4">{reg.position}</td>
                          <td className="px-6 py-4 text-xs font-mono">{new Date(reg.timestamp).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-8 max-w-3xl">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">웨비나 상세 정보</h2>
                <p className="text-sm text-slate-400">랜딩 페이지에 표시될 내용을 실시간으로 관리합니다.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400">유튜브 라이브 링크</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/live/..." />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400">웨비나 주제 (Title)</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none" value={topic.title} onChange={(e) => setTopic({...topic, title: e.target.value})} />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400">상세 설명 (Description)</label>
                  <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white h-24 focus:ring-1 focus:ring-blue-500 outline-none" value={topic.description} onChange={(e) => setTopic({...topic, description: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-400">타임라인 (Schedule)</label>
                  <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white h-32 focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={topic.schedule} onChange={(e) => setTopic({...topic, schedule: e.target.value})} placeholder="14:00 - 오프닝" />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-400">연사 약력 (Speaker)</label>
                  <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white h-32 focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={topic.speaker} onChange={(e) => setTopic({...topic, speaker: e.target.value})} placeholder="홍길동 소장..." />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400">대표 이미지 URL (OpenGraph)</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none" value={topic.imageUrl} onChange={(e) => setTopic({...topic, imageUrl: e.target.value})} />
                </div>
              </div>
              <button 
                onClick={handleWebinarSave} 
                disabled={saveStatus === 'saving'}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'success' ? '저장 완료!' : '변경 사항 저장'}
              </button>
            </div>
          )}

          {activeTab === 'firebase' && (
             <div className="space-y-8">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  GitHub Pages 연동 주의사항
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Firebase Console > Authentication > Settings > <b>Authorized domains</b>에 <br/>
                  <code className="text-emerald-300 font-mono">finisher33.github.io</code> 도메인을 반드시 등록해야 데이터 저장이 가능합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['apiKey', 'projectId', 'authDomain', 'appId', 'storageBucket', 'measurementId'].map((f) => (
                  <div key={f} className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{f}</label>
                    <input type="text" value={(fbConfig as any)[f]} onChange={(e) => setFbConfig({...fbConfig, [f]: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 outline-none font-mono" />
                  </div>
                ))}
              </div>
              <button onClick={handleFbSave} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                연동 설정 저장 및 새로고침
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
