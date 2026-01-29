# -*- coding: utf-8 -*-
"""運勢分析引擎（大運流年）"""

from typing import List, Dict, Optional
from data_structures import BaZi, DaYun, YunShiAnalysis


class YunShiAnalyzer:
    """運勢分析引擎"""

    WUXING_SHENGKE = {
        "金": {"生": "水", "克": "木", "被生": "土", "被克": "火"},
        "木": {"生": "火", "克": "土", "被生": "水", "被克": "金"},
        "水": {"生": "木", "克": "火", "被生": "金", "被克": "土"},
        "火": {"生": "土", "克": "金", "被生": "木", "被克": "水"},
        "土": {"生": "金", "克": "水", "被生": "火", "被克": "木"},
    }

    SHISHEN_MAP = {
        "比肩": 1, "劫财": 0.5, "食神": 2, "伤官": 1,
        "偏财": 2, "正财": 3, "七杀": -2, "正官": 1,
        "偏印": 0, "正印": 2,
    }

    def __init__(self, bazi: BaZi):
        self.bazi = bazi
        self.dayun_list: List[DaYun] = self._calculate_dayun()

    def _calculate_dayun(self) -> List[DaYun]:
        """計算大運（簡化示例）"""
        dayun_list: List[DaYun] = []
        for i in range(10):
            dayun = DaYun(
                index=i,
                ganzhi="甲子",
                age_start=i * 10,
                age_end=i * 10 + 9,
                element=self._get_wuxing("甲"),
                current=(i == 3),
            )
            dayun_list.append(dayun)
        return dayun_list

    def analyze_dayun(self, dayun: DaYun) -> YunShiAnalysis:
        """分析單一大運"""
        day_master_element = self._get_wuxing(self.bazi.day_master)
        dayun_element = dayun.element
        relation = self._analyze_relation(day_master_element, dayun_element)
        score = self._calculate_score(relation)
        return YunShiAnalysis(
            dayun=dayun,
            score=score,
            level=self._get_level(score),
            summary=self._generate_summary(score, relation),
            details=self._generate_details(relation),
            suggestions=self._generate_suggestions(score, relation),
        )

    def _analyze_relation(self, master: str, dayun: str) -> Dict[str, str]:
        r: Dict[str, str] = {}
        if master == dayun:
            r["type"] = "同我"
        elif self.WUXING_SHENGKE[master]["生"] == dayun:
            r["type"] = "我生"
        elif self.WUXING_SHENGKE[master]["克"] == dayun:
            r["type"] = "我克"
        elif self.WUXING_SHENGKE[master]["被生"] == dayun:
            r["type"] = "生我"
        else:
            r["type"] = "克我"
        return r

    def _calculate_score(self, relation: Dict[str, str]) -> float:
        scores = {
            "生我": 3.0, "同我": 1.0, "我克": 0.5,
            "我生": -1.0, "克我": -2.0,
        }
        return scores.get(relation.get("type", ""), 0.0)

    def _get_level(self, score: float) -> str:
        if score >= 3:
            return "大吉"
        if score >= 1.5:
            return "中吉"
        if score >= 0.5:
            return "小吉"
        if score >= -0.5:
            return "平"
        if score >= -1.5:
            return "小凶"
        if score >= -3:
            return "中凶"
        return "大凶"

    def _generate_summary(self, score: float, relation: Dict[str, str]) -> str:
        summaries = {
            "生我": "貴人相助，學習成長",
            "同我": "朋友幫扶，合作有利",
            "我克": "求財有望，但需努力",
            "我生": "付出較多，注意健康",
            "克我": "壓力較大，謹慎行事",
        }
        return summaries.get(relation.get("type", ""), "運勢平穩")

    def _generate_details(self, relation: Dict[str, str]) -> List[str]:
        t = relation.get("type", "")
        if t == "生我":
            return ["利於學習考試", "易得長輩幫助", "事業有發展機會"]
        if t == "同我":
            return ["適合合作求財", "注意朋友關係", "避免盲目投資"]
        return []

    def _generate_suggestions(self, score: float, relation: Dict[str, str]) -> List[str]:
        suggestions: List[str] = []
        if score > 1:
            suggestions.append("積極進取，把握機會")
        elif score < -1:
            suggestions.append("保守為宜，注意安全")
            suggestions.append("避免重大決策")
        if relation.get("type") == "克我":
            suggestions.extend(["注意身體健康", "避免與人衝突"])
        elif relation.get("type") == "我生":
            suggestions.extend(["注意勞逸結合", "投資需謹慎"])
        return suggestions

    def _get_wuxing(self, gan: str) -> str:
        m = {
            "甲": "木", "乙": "木", "丙": "火", "丁": "火",
            "戊": "土", "己": "土", "庚": "金", "辛": "金",
            "壬": "水", "癸": "水",
        }
        return m.get(gan[0] if gan else "甲", "木")
