import { useState } from "react";
import { LogIn } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signOut, forceSignOutUI, markJustSignedUp } = useAuth();

  const resetFields = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!firstName.trim() || !lastName.trim()) {
          setError("First name and last name are required");
          return;
        }

        // ✅ signup'tan sonra oluşabilecek kısa süreli SIGNED_IN event’ini ignore et
        markJustSignedUp();

        const { error } = await signUp(email, password, firstName, lastName);

        if (error) {
          setError(error.message ?? "Sign up failed");
          return;
        }

        // ✅ Flicker fix: UI'ı anında unauth yap, dashboard hiç görünmesin
        forceSignOutUI();

        // ✅ gerçek session/cookie temizliği
        await signOut();

        // ✅ Sign In ekranına dön
        setIsSignUp(false);
        resetFields();
        return;
      }

      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message ?? "Sign in failed");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-slate-900 mb-8">
            Agency Manager
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Taylor"
                    required
                  />
                </div>

                <div className="w-1/2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Swift"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp((v) => !v);
                setError("");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              type="button"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
