import { useState, useEffect } from 'react';
import { Upload, Download, Smartphone, Monitor, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';

export function PlatformReleases() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [releases, setReleases] = useState<any[]>([]);

  const [version, setVersion] = useState('1.0.3');
  const [buildNumber, setBuildNumber] = useState(3);
  const [platform, setPlatform] = useState<'android' | 'windows' | 'web'>('android');
  const [fileType, setFileType] = useState<'apk' | 'aab' | 'exe'>('apk');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [whatsNew, setWhatsNew] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/releases');
      setReleases(res.data || []);
    } catch {
      toast.error('Failed loading app releases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim()) {
      toast.error('Please enter version number');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('version', version);
      formData.append('buildNumber', String(buildNumber));
      formData.append('platform', platform);
      formData.append('fileType', fileType);
      formData.append('forceUpdate', String(forceUpdate));
      formData.append('whatsNew', whatsNew);
      if (file) {
        formData.append('file', file);
      }

      await api.post('/releases/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`Release v${version} created successfully!`);
      setWhatsNew('');
      setFile(null);
      fetchReleases();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed creating release');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Self-Hosted App Release & Update Manager"
        subtitle="Upload & distribute Android APK, AAB, and Windows Desktop EXE binaries"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">New Binary Release</h2>
              <p className="text-xs text-slate-500">Upload APK / AAB / EXE file</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Version *
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.3"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Build Number
                </label>
                <input
                  type="number"
                  value={buildNumber}
                  onChange={(e) => setBuildNumber(Number(e.target.value))}
                  placeholder="3"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="android">Android APK</option>
                  <option value="windows">Windows Desktop</option>
                  <option value="web">Web Application</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Binary Format
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="apk">.APK File</option>
                  <option value="aab">.AAB File</option>
                  <option value="exe">.EXE Installer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Upload File (.apk, .aab, .exe)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".apk,.aab,.exe"
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Release Notes / What's New
              </label>
              <textarea
                value={whatsNew}
                onChange={(e) => setWhatsNew(e.target.value)}
                placeholder="List key release improvements (1 per line)..."
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="forceUpdate"
                checked={forceUpdate}
                onChange={(e) => setForceUpdate(e.target.checked)}
                className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="forceUpdate" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mandatory / Force Update (Block legacy apps)
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>Publish App Release</span>
            </button>
          </form>
        </div>

        {/* Releases Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Release History</h2>
            </div>
            <button
              onClick={fetchReleases}
              className="p-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">VERSION</th>
                  <th className="pb-3">PLATFORM</th>
                  <th className="pb-3">RELEASE NOTES</th>
                  <th className="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {releases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No custom releases uploaded yet.
                    </td>
                  </tr>
                ) : (
                  releases.map((rel) => (
                    <tr key={rel._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 pr-2">
                        <div className="font-bold text-slate-900 dark:text-slate-100">v{rel.version}</div>
                        <div className="text-slate-400 text-[11px]">Build #{rel.buildNumber}</div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 capitalize px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-semibold">
                          {rel.platform === 'android' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                          {rel.platform} ({rel.fileType})
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        {rel.whatsNew?.join(', ') || rel.message}
                      </td>
                      <td className="py-3 text-right">
                        <a
                          href={rel.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
