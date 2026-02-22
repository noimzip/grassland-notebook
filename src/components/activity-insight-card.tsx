import React from "react";
import { 
  Sparkles, 
  Lightbulb, 
  Rocket, 
  Users, 
  Search,
  MessageSquare,
  Zap
} from "lucide-react";
import type { GitHubActivityDetails } from "@/lib/github-api-details";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface ActivityInsightCardProps {
  details: GitHubActivityDetails;
}

export function ActivityInsightCard({ details }: ActivityInsightCardProps) {
  const getInsight = () => {
    const { commits, pullRequests, issues, reviews, total } = details;
    
    if (total === 0) return {
      title: "旅の始まり",
      message: "まだ活動記録がありません。最初のコミットから庭園を育て始めましょう！",
      icon: Rocket,
      color: "text-blue-500"
    };

    // logic to determine tendencies
    const max = Math.max(commits, pullRequests, issues, reviews);
    
    if (reviews === max && reviews > 0) return {
      title: "協力的なレビュアー",
      message: "あなたはコードレビューを通じてチームの品質向上に大きく貢献しています。素晴らしいフォロワーシップです！",
      icon: Search,
      color: "text-pink-500"
    };
    
    if (issues === max && issues > 0) return {
      title: "課題解決の達人",
      message: "積極的にIssueを起票し、プロジェクトの課題を明確にしています。改善への意欲が非常に高いです。",
      icon: Lightbulb,
      color: "text-emerald-500"
    };
    
    if (pullRequests === max && pullRequests > 0) return {
      title: "積極的な開発者",
      message: "多くのプルリクエストを作成し、新機能の追加や改善をリードしています。実行力が抜群です。",
      icon: Zap,
      color: "text-purple-500"
    };
    
    if (commits > total * 0.8) return {
      title: "孤高の職人",
      message: "着実にコミットを積み重ね、自身のコードを磨き続けています。一歩一歩の積み重ねが美しい庭園を作ります。",
      icon: Sparkles,
      color: "text-blue-500"
    };

    return {
      title: "バランス型プレイヤー",
      message: "開発、レビュー、課題管理をバランスよくこなしています。プロジェクト全体の円滑な進行に欠かせない存在です。",
      icon: Users,
      color: "text-orange-500"
    };
  };

  const insight = getInsight();

  return (
    <Card className="h-full border-primary/20 bg-primary/5 backdrop-blur-sm shadow-sm border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <insight.icon className={`w-4 h-4 ${insight.color}`} />
          パーソナル分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-lg font-black tracking-tight">{insight.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            &quot;{insight.message}&quot;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
