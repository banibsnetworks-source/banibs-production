import React, { useEffect, useState } from 'react';
import { Book, Code, Download, ExternalLink } from 'lucide-react';

function DevDocsPage() {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/docs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch docs');
      const data = await response.json();
      setDocs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !docs) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Book className="mr-3 text-[#39FF14]" size={40} />
            API Documentation
          </h1>
          <p className="text-gray-400">{docs.overview.description}</p>
        </div>

        {/* Overview */}
        <div className="bg-gray-800/50 border border-[#39FF14]/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
          <div className="space-y-2 text-gray-300">
            <div><span className="text-gray-500">Version:</span> {docs.overview.version}</div>
            <div><span className="text-gray-500">Base URL:</span> <code className="text-[#39FF14]">{docs.overview.base_url}</code></div>
            <div><span className="text-gray-500">Authentication:</span> {docs.overview.authentication}</div>
          </div>
        </div>

        {/* SDKs */}
        <div className="bg-gray-800/50 border border-[#39FF14]/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Download className="mr-2 text-[#39FF14]" />
            SDKs & Libraries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {docs.sdks.map(sdk => (
              <div key={sdk.language} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">{sdk.language}</h3>
                <code className="text-[#39FF14] text-sm block mb-3">{sdk.install}</code>
                <a
                  href={sdk.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  Download <ExternalLink className="ml-1" size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Code className="mr-2 text-[#39FF14]" />
            API Endpoints
          </h2>
          {docs.endpoints.map(category => (
            <div key={category.category} className="bg-gray-800/50 border border-[#39FF14]/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">{category.category}</h3>
              <p className="text-gray-400 mb-4">{category.description}</p>
              <div className="space-y-2">
                {category.endpoints.map((endpoint, idx) => (
                  <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                        endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                        endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-[#39FF14] font-mono text-sm">{endpoint.path}</code>
                    </div>
                    <span className="text-gray-400 text-sm">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DevDocsPage;
